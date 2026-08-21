const actions = [
  { title: 'Mostre uma conquista', text: 'Faça um story curto de uma aluna, com autorização, mostrando uma melhoria ou rotina no estúdio.', goal: 'Atrair novas pessoas' },
  { title: 'Dê uma dica rápida', text: 'Publique uma dica simples de postura ou bem-estar para quem passa muito tempo sentado.', goal: 'Gerar confiança' },
  { title: 'Convide para conhecer', text: 'Envie uma mensagem para um contato interessado convidando para uma aula experimental.', goal: 'Atrair novas pessoas' },
  { title: 'Valorize a comunidade', text: 'Faça um story mostrando o ambiente acolhedor antes de uma aula, sem expor alunos sem autorização.', goal: 'Reter alunos' },
  { title: 'Celebre uma presença', text: 'Agradeça a turma da semana e incentive cada aluno a manter sua rotina.', goal: 'Reter alunos' },
  { title: 'Mostre o estúdio', text: 'Publique um vídeo curto do espaço organizado e preparado para receber os alunos.', goal: 'Atrair novas pessoas' },
  { title: 'Planeje a semana', text: 'Prepare uma ideia de conteúdo para a próxima semana e anote o melhor horário para publicar.', goal: 'Organizar marketing' },
];
export function dailyMarketingAction(now = new Date()) { return actions[(now.getDay() + 6) % 7]; }
