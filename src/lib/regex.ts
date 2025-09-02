const RegExpLogs = {
  BackupStart: new RegExp("\\bUm novo backup iniciou.  Número de tarefas na fila: 1\\b"),
  TaskRunning: new RegExp('\\bA tarefa está agora\\b'),
  BackupError: new RegExp("\\bERR \\b"),
  AfterError: new RegExp("\\bRevertendo o módulo de trabalho\\b"),
  BackupFinish: new RegExp("\\bBackup terminado\\b")
}

export default RegExpLogs