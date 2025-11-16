import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

export default function WeeklyGoalCard({ goal = 10, completed = 6 }) {

  const progress = completed / goal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Meta da Semana</Text>

      <Text style={styles.subtitle}>
        {completed} de {goal} tarefas concluídas
      </Text>

      <ProgressBar 
        progress={progress} 
        style={styles.progress}
      />

      <Text style={styles.percent}>
        {Math.round(progress * 100)}% completo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4b0082",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 12,
  },
  progress: {
    height: 10,
    borderRadius: 10,
  },
  percent: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#4b0082",
  },
});
