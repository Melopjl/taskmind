import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, Switch, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [showRecuperacao, setShowRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, senha);
      
      await AsyncStorage.setItem('@token', response.data.token);
      await AsyncStorage.setItem('@usuario', JSON.stringify(response.data.usuario));
      
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    if (!nome || !email || !senha || !curso) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const dadosUsuario = {
        nome,
        email,
        senha,
        curso,
        semestre: semestre || null,
        telefone: telefone || null,
        data_nascimento: dataNascimento || null
      };

      const response = await authAPI.registrar(dadosUsuario);
      
      await AsyncStorage.setItem('@token', response.data.token);
      await AsyncStorage.setItem('@usuario', JSON.stringify(response.data.usuario));
      
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async () => {
    if (!emailRecuperacao) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }

    setLoading(true);
    try {
      await authAPI.recuperarSenha(emailRecuperacao);
      Alert.alert('Sucesso', 'Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowRecuperacao(false);
      setEmailRecuperacao('');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isRegistrando ? 'Criar Conta' : 'TaskMind'}
            </Title>
            <Text style={styles.subtitle}>
              {isRegistrando ? 'Preencha seus dados' : 'Entre na sua conta'}
            </Text>
            
            {isRegistrando && (
              <>
                <TextInput
                  label="Nome Completo *"
                  value={nome}
                  onChangeText={setNome}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                />
                
                <TextInput
                  label="Curso *"
                  value={curso}
                  onChangeText={setCurso}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="school" />}
                />
                
                <View style={styles.row}>
                  <TextInput
                    label="Semestre"
                    value={semestre}
                    onChangeText={setSemestre}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                  
                  <TextInput
                    label="Data Nasc."
                    value={dataNascimento}
                    onChangeText={setDataNascimento}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    placeholder="DD/MM/AAAA"
                  />
                </View>
                
                <TextInput
                  label="Telefone"
                  value={telefone}
                  onChangeText={setTelefone}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
              </>
            )}
            
            <TextInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
            />
            
            <TextInput
              label="Senha *"
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              left={<TextInput.Icon icon="lock" />}
            />
            
            <Button
              mode="contained"
              onPress={isRegistrando ? handleRegistrar : handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {isRegistrando ? 'Criar Conta' : 'Entrar'}
            </Button>
            
            {!isRegistrando && (
              <Button
                mode="text"
                onPress={() => setShowRecuperacao(true)}
                style={styles.linkButton}
              >
                Esqueci minha senha
              </Button>
            )}
            
            <View style={styles.switchContainer}>
              <Text>
                {isRegistrando ? 'Já tem conta?' : 'Não tem conta?'}
              </Text>
              <Button
                mode="text"
                onPress={() => setIsRegistrando(!isRegistrando)}
                style={styles.toggleButton}
              >
                {isRegistrando ? 'Fazer Login' : 'Criar Conta'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Recuperação de Senha */}
      <Portal>
        <Modal
          visible={showRecuperacao}
          onDismiss={() => setShowRecuperacao(false)}
          contentContainerStyle={styles.modal}
        >
          <Card>
            <Card.Content>
              <Title>Recuperar Senha</Title>
              <Text style={styles.modalText}>
                Informe seu email para receber as instruções de recuperação
              </Text>
              
              <TextInput
                label="Email"
                value={emailRecuperacao}
                onChangeText={setEmailRecuperacao}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowRecuperacao(false)}
                  style={styles.modalButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleRecuperarSenha}
                  loading={loading}
                  style={styles.modalButton}
                >
                  Enviar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  button: {
    marginTop: 10,
    padding: 5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleButton: {
    marginLeft: 5,
  },
  modal: {
    margin: 20,
  },
  modalText: {
    marginBottom: 15,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 0.48,
  },
});