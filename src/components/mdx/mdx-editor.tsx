'use client';
import '@mdxeditor/editor/style.css';
import dynamic from 'next/dynamic';

export const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: true }
);
