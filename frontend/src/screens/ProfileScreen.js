import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Avatar,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getPerfil();
      const dados = response.data.usuario;
      setUsuario(dados);
      setNome(dados.nome);
      setCurso(dados.curso || '');
      setSemestre(dados.semestre?.toString() || '');
      setTelefone(dados.telefone || '');
      setDataNascimento(dados.data_nascimento || '');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPerfil = async () => {
    try {
      setLoading(true);
      const dadosAtualizacao = {
        nome,
        curso,
        semestre: semestre ? parseInt(semestre) : null,
        telefone,
        data_nascimento: dataNascimento || null,
      };

      await userAPI.atualizarPerfil(dadosAtualizacao);
      const usuarioAtualizado = { ...usuario, ...dadosAtualizacao };
      setUsuario(usuarioAtualizado);
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));

      setEditando(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Imagem
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à galeria para alterar a foto.'
        );
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;
      await uploadImage(result.assets[0].uri);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('foto', {
        uri,
        type: 'image/jpeg',
        name: 'foto-perfil.jpg',
      });

      const response = await userAPI.uploadFoto(formData);
      const usuarioAtualizado = { ...usuario, foto_perfil: response.data.foto_perfil };
      setUsuario(usuarioAtualizado);
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = async () => {
    Alert.alert('Remover foto', 'Deseja realmente remover sua foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            setUploading(true);
            await userAPI.removerFoto();
            const usuarioAtualizado = { ...usuario, foto_perfil: null };
            setUsuario(usuarioAtualizado);
            await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));
            Alert.alert('Sucesso', 'Foto removida.');
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a foto.');
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['@token', '@usuario']);
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (loading && !usuario) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f5b400" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* header*/}
      <Card style={styles.profileHeader}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {usuario?.foto_perfil ? (
              <Avatar.Image
                source={{
                  uri: `http://192.168.1.19:3000${usuario.foto_perfil}`,
                }}
                size={100}
                style={{ backgroundColor: '#333' }} 
              />
            ) : (
              <Avatar.Text
                size={100}
                label={usuario?.nome?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                style={{ backgroundColor: '#333' }} 
                color="#f5b400" 
              />
            )}

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Button
                mode="outlined"
                onPress={pickImage}
                loading={uploading}
                disabled={uploading}
                style={styles.changePhotoButton}
                icon="camera"
                textColor="#f5b400"
              >
                {uploading ? 'Enviando...' : 'Alterar'}
              </Button>
              {usuario?.foto_perfil && (
                <Button
                  mode="text"
                  onPress={removerFoto}
                  disabled={uploading}
                  textColor="#f44336"
                >
                  Remover
                </Button>
              )}
            </View>
          </View>

          <View style={styles.userInfo}>
            <Title style={styles.userName}>{usuario?.nome}</Title>
            <Text style={styles.userEmail}>{usuario?.email}</Text>
            {usuario?.curso && (
              <Text style={styles.userCourse}>
                {usuario.curso} - {usuario.semestre}º semestre
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* informações pessoais*/}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>📋 Informações Pessoais</Title>
            <Button mode="text" onPress={() => setEditando(!editando)} textColor="#f5b400">
              {editando ? 'Cancelar' : 'Editar'}
            </Button>
          </View>

          {editando ? (
            <>
              <TextInput
                label="Nome"
                value={nome}
                onChangeText={setNome}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#f5b400' } }}
              />
              <TextInput
                label="Curso"
                value={curso}
                onChangeText={setCurso}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#f5b400' } }}
              />
              <TextInput
                label="Semestre"
                value={semestre}
                onChangeText={setSemestre}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#f5b400' } }}
              />
              <TextInput
                label="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#f5b400' } }}
              />
              <TextInput
                label="Data de Nascimento"
                value={dataNascimento}
                onChangeText={setDataNascimento}
                placeholder="DD/MM/AAAA"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#f5b400' } }}
              />
              <Button
                mode="contained"
                onPress={handleSalvarPerfil}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                buttonColor="#f5b400"
                textColor="#000"
              >
                Salvar Alterações
              </Button>
            </>
          ) : (
            <View style={styles.infoContainer}>
              <InfoItem icon="person" label="Nome" value={usuario?.nome} />
              <Divider />
              <InfoItem icon="email" label="Email" value={usuario?.email} />
              <Divider />
              {usuario?.curso && <InfoItem icon="school" label="Curso" value={usuario.curso} />}
              {usuario?.semestre && (
                <InfoItem icon="menu-book" label="Semestre" value={`${usuario.semestre}º`} />
              )}
              {usuario?.telefone && <InfoItem icon="phone" label="Telefone" value={usuario.telefone} />}
              {usuario?.data_nascimento && (
                <InfoItem
                  icon="cake"
                  label="Nascimento"
                  value={new Date(usuario.data_nascimento).toLocaleDateString('pt-BR')}
                />
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* botao sair */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>⚙️ Ações</Title>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#f44336"
            icon="logout"
          >
            Sair da Conta
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <MaterialIcons name={icon} size={20} color="#f5b400" style={{ marginRight: 8 }} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  profileHeader: { margin: 10, backgroundColor: '#000' },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { alignItems: 'center', marginRight: 20 },
  avatar: { backgroundColor: '#333' },
  changePhotoButton: { borderColor: '#f5b400', marginRight: 10 },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontSize: 20 },
  userEmail: { color: 'white', opacity: 0.9 },
  userCourse: { color: 'white', opacity: 0.9, marginTop: 5 },
  sectionCard: { margin: 10, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18 },
  input: { marginBottom: 15 },
  saveButton: { marginTop: 10 },
  infoContainer: { marginTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontWeight: 'bold', color: '#444' },
  infoValue: { color: '#555', textAlign: 'right', flex: 1, marginLeft: 10 },
  logoutButton: { marginTop: 10 },
});
