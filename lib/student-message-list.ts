export function removeStudentMessage<T extends { id: string }>(messages: T[], messageId: string) {
  return messages.filter((message: T) => message.id !== messageId);
}
