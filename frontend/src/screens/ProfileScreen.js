import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Card, Title, Text, Button, TextInput, Avatar, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { userAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  // Estados de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getPerfil();
      setUsuario(response.data.usuario);

      setNome(response.data.usuario.nome);
      setCurso(response.data.usuario.curso || '');
      setSemestre(response.data.usuario.semestre?.toString() || '');
      setTelefone(response.data.usuario.telefone || '');
      setDataNascimento(response.data.usuario.data_nascimento || '');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
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
        data_nascimento: dataNascimento || null
      };

      await userAPI.atualizarPerfil(dadosAtualizacao);

      const usuarioAtualizado = { ...usuario, ...dadosAtualizacao };
      setUsuario(usuarioAtualizado);
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));

      setEditando(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      setLoading(true);
      await userAPI.alterarSenha({
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      });

      setAlterarSenha(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível alterar a senha');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('foto', { uri, type: 'image/jpeg', name: 'foto-perfil.jpg' });
      const response = await userAPI.uploadFoto(formData);

      const usuarioAtualizado = { ...usuario, foto_perfil: response.data.foto_perfil };
      setUsuario(usuarioAtualizado);
      await AsyncStorage.setItem('@usuario', JSON.stringify(usuarioAtualizado));
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a foto');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['@token', '@usuario']);
          navigation.replace('Login');
        }
      }
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
      {/* Header do Perfil */}
      <Card style={styles.profileHeader}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {usuario?.foto_perfil ? (
              <Avatar.Image 
                source={{ uri: `http://192.168.1.100:3000/${usuario.foto_perfil}` }}
                size={100}
              />
            ) : (
              <Avatar.Text 
                size={100}
                label={usuario?.nome?.split(' ').map(n => n[0]).join('').toUpperCase()}
                style={styles.avatar}
              />
            )}
            
            <Button 
              mode="outlined" 
              onPress={pickImage}
              loading={uploading}
              disabled={uploading}
              style={styles.changePhotoButton}
              icon="camera"
              textColor="#f5b400"
            >
              Alterar
            </Button>
          </View>

          <View style={styles.userInfo}>
            <Title style={styles.userName}>{usuario?.nome}</Title>
            <Text style={styles.userEmail}>{usuario?.email}</Text>
            {usuario?.curso && (
              <Text style={styles.userCourse}>{usuario.curso} - {usuario.semestre}º semestre</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Informações Pessoais */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>📋 Informações Pessoais</Title>
            <Button 
              mode="text" 
              onPress={() => setEditando(!editando)}
              compact
              textColor="#f5b400"
            >
              {editando ? 'Cancelar' : 'Editar'}
            </Button>
          </View>

          {editando ? (
            <>
              <TextInput label="Nome Completo" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Curso" value={curso} onChangeText={setCurso} style={styles.input} mode="outlined" theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Semestre" value={semestre} onChangeText={setSemestre} style={styles.input} mode="outlined" keyboardType="numeric" theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Telefone" value={telefone} onChangeText={setTelefone} style={styles.input} mode="outlined" keyboardType="phone-pad" theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Data de Nascimento" value={dataNascimento} onChangeText={setDataNascimento} style={styles.input} mode="outlined" placeholder="DD/MM/AAAA" theme={{ colors: { primary: '#f5b400' } }} />
              <Button mode="contained" onPress={handleSalvarPerfil} loading={loading} disabled={loading} style={[styles.saveButton, { backgroundColor: '#f5b400' }]} textColor="#000">Salvar Alterações</Button>
            </>
          ) : (
            <>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Nome:</Text><Text style={styles.infoValue}>{usuario?.nome}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Email:</Text><Text style={styles.infoValue}>{usuario?.email}</Text></View>
              {usuario?.curso && <View style={styles.infoRow}><Text style={styles.infoLabel}>Curso:</Text><Text style={styles.infoValue}>{usuario.curso}</Text></View>}
              {usuario?.semestre && <View style={styles.infoRow}><Text style={styles.infoLabel}>Semestre:</Text><Text style={styles.infoValue}>{usuario.semestre}º</Text></View>}
              {usuario?.telefone && <View style={styles.infoRow}><Text style={styles.infoLabel}>Telefone:</Text><Text style={styles.infoValue}>{usuario.telefone}</Text></View>}
              {usuario?.data_nascimento && <View style={styles.infoRow}><Text style={styles.infoLabel}>Data Nasc.:</Text><Text style={styles.infoValue}>{new Date(usuario.data_nascimento).toLocaleDateString('pt-BR')}</Text></View>}
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Membro desde:</Text><Text style={styles.infoValue}>{new Date(usuario?.data_criacao).toLocaleDateString('pt-BR')}</Text></View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Segurança */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🔒 Segurança</Title>
          <Button mode="outlined" onPress={() => setAlterarSenha(true)} style={styles.securityButton} icon="lock" textColor="#f5b400">Alterar Senha</Button>
        </Card.Content>
      </Card>

      {/* Ações */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>⚙️ Ações</Title>
          <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} icon="logout" buttonColor="#f44336">Sair da Conta</Button>
        </Card.Content>
      </Card>

      {/* Modal Alterar Senha */}
      <Portal>
        <Modal visible={alterarSenha} onDismiss={() => setAlterarSenha(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Alterar Senha</Title>
              <TextInput label="Senha Atual" value={senhaAtual} onChangeText={setSenhaAtual} style={styles.modalInput} mode="outlined" secureTextEntry theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Nova Senha" value={novaSenha} onChangeText={setNovaSenha} style={styles.modalInput} mode="outlined" secureTextEntry theme={{ colors: { primary: '#f5b400' } }} />
              <TextInput label="Confirmar Nova Senha" value={confirmarSenha} onChangeText={setConfirmarSenha} style={styles.modalInput} mode="outlined" secureTextEntry theme={{ colors: { primary: '#f5b400' } }} />

              <View style={styles.modalButtons}>
                <Button mode="outlined" onPress={() => setAlterarSenha(false)} style={[styles.modalButton, styles.modalButtonOutlined]} textColor="#f5b400">Cancelar</Button>
                <Button mode="contained" onPress={handleAlterarSenha} loading={loading} disabled={loading} style={[styles.modalButton, styles.modalButtonContained]} textColor="#000">Alterar</Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  profileHeader: { margin: 10, backgroundColor: '#000000ff' },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { alignItems: 'center', marginRight: 20 },
  avatar: { backgroundColor: '#525252ff' },
  changePhotoButton: { marginTop: 10, borderColor: '#f5b400' },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontSize: 20 },
  userEmail: { color: 'white', opacity: 0.9 },
  userCourse: { color: 'white', opacity: 0.9, marginTop: 5 },
  sectionCard: { margin: 10, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18 },
  input: { marginBottom: 15 },
  saveButton: { marginTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontWeight: '500', color: '#666' },
  infoValue: { flex: 1, textAlign: 'right' },
  securityButton: { marginTop: 5 },
  logoutButton: { marginTop: 5 },
  modal: { margin: 20, backgroundColor: '#fff', borderRadius: 8, padding: 20, borderColor: '#f5b400', borderWidth: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalButton: { flex: 0.48 },
  modalButtonOutlined: { borderColor: '#f5b400' },
  modalButtonContained: { backgroundColor: '#f5b400' },
  modalTitle: { color: '#f5b400', marginBottom: 10 },
  modalInput: { marginBottom: 12 },
});
