
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export const exportChatsToExcel = (sessions: ChatSession[], maxSessions: number = 20) => {
  // Limit to the most recent sessions based on maxSessions parameter
  const recentSessions = [...sessions]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxSessions);
  
  // Create a workbook with a worksheet for each chat
  const workbook = XLSX.utils.book_new();
  
  recentSessions.forEach((session) => {
    // Format session title to be valid as a sheet name (31 chars max, no special chars)
    const sheetName = session.title
      .replace(/[\\\/\[\]\*\?:]/g, '')
      .substring(0, 30);
    
    // Convert messages to a format suitable for Excel
    const data = session.messages.map((msg, index) => ({
      Index: index + 1,
      Role: msg.role.charAt(0).toUpperCase() + msg.role.slice(1),
      Content: msg.content,
      Timestamp: msg.timestamp instanceof Date ? msg.timestamp.toLocaleString() : new Date(msg.timestamp).toLocaleString()
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = [
      { wch: 6 },     // Index
      { wch: 10 },    // Role
      { wch: 80 },    // Content
      { wch: 20 }     // Timestamp
    ];
    worksheet['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, `KatagrafyAI_Chats_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  return recentSessions.length;
};
