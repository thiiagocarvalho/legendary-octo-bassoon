type DashboardMessage = {
  id: string;
  student: { fullName: string };
  content: string;
  createdAt: Date;
};

export function latestDashboardMessages(messages: DashboardMessage[]) {
  return [...messages].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime()).slice(0, 5);
}
