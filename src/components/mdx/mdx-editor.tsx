'use client';
import '@alan/editor/style.css';
import dynamic from 'next/dynamic';

export const MDXEditor = dynamic(
  () => import('@alan/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);
