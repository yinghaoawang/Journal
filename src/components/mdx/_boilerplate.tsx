import React from 'react';
import {
  markdownShortcutPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  UndoRedo,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  InsertCodeBlock
} from '@mdxeditor/editor';

export async function expressImageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  const response = await fetch('/uploads/new', {
    method: 'POST',
    body: formData
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

export const ALL_PLUGINS = [
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <UndoRedo />
        <BlockTypeSelect />
        <BoldItalicUnderlineToggles />
        <CodeToggle />
        <InsertCodeBlock />
        <CreateLink />
        <InsertImage />
        <InsertTable />
        <ListsToggle />
      </>
    )
  }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin(),
  tablePlugin(),
  thematicBreakPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: 'JavaScript',
      css: 'CSS',
      txt: 'text',
      tsx: 'TypeScript'
    }
  }),
  markdownShortcutPlugin()
];
