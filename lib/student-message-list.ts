export function removeStudentMessage<T extends { id: string }>(messages: T[], messageId: string) {
  return messages.filter((message) => message.id !== messageId);
}
