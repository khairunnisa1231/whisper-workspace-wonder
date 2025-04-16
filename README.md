
# Katagrafy.ai Chat Application

This is a chat application powered by Supabase for authentication and database storage, and Google's Gemini AI for intelligent responses.

## Setup Instructions

### 1. Supabase Setup

1. Connect this Lovable project to Supabase by clicking the green Supabase button in the top right corner.
2. After connecting, execute the SQL schema by going to the SQL Editor in Supabase and running the contents of the `supabase/schema.sql` file.

### 2. Google Gemini API Setup

1. Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. When running the application, you'll be prompted to enter this API key.
3. For production, add the API key to Supabase Edge Function Secrets under the key `GEMINI_API_KEY`.

## Features

- User authentication via Supabase Auth
- Real-time chat with AI powered by Google's Gemini
- Chat history management
- File uploads and management
- Customizable AI appearance

## Technical Architecture

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini

## Database Schema

The application uses the following tables:
- `profiles`: User information
- `chat_sessions`: Chat conversations
- `chat_messages`: Individual messages in chats
- `files`: Uploaded file metadata

## Local Development

1. Connect to Supabase
2. Run the application
3. Enter your Gemini API key when prompted
