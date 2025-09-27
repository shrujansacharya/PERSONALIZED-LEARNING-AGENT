import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { subject } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: 'Missing subject' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing YouTube API key' }, { status: 500 });
    }

    const response = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      q: `${subject} tutorial education`,
      type: ['video'],
      maxResults: 5,
      order: 'relevance',
    });

    const videos = response.data.items?.map((item) => ({
      title: item.snippet?.title || '',
      video_id: item.id?.videoId || '',
      thumbnail: item.snippet?.thumbnails?.default?.url || '',
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
