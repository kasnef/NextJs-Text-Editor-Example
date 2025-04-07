import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, RawCommands } from '@tiptap/core';

export interface ImageAlignOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageAlign: {
      setImageAlign: (align: string) => ReturnType;
    };
  }
}

export const ImageAlign = Extension.create<ImageAlignOptions>({
  name: 'imageAlign',

  addOptions() {
    return {
      types: ['image'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          align: {
            default: 'left',
            parseHTML: element => element.getAttribute('data-align') || 'left',
            renderHTML: attributes => {
              if (!attributes.align) {
                return {};
              }

              return {
                'data-align': attributes.align,
                style: `text-align: ${attributes.align};`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setImageAlign: (align: string) => ({ commands }) => {
        return commands.updateAttributes('image', { align });
      },
    };
  },
}); 