'use client';

import { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Undo, Redo, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RichEditor({
  value,
  onChange,
  placeholder = 'Write the announcement body...',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tools: { icon: typeof Bold; cmd: string; arg?: string; label: string }[] = [
    { icon: Bold, cmd: 'bold', label: 'Bold' },
    { icon: Italic, cmd: 'italic', label: 'Italic' },
    { icon: Heading2, cmd: 'formatBlock', arg: '<h2>', label: 'Heading 2' },
    { icon: Heading3, cmd: 'formatBlock', arg: '<h3>', label: 'Heading 3' },
    { icon: List, cmd: 'insertUnorderedList', label: 'Bulleted list' },
    { icon: ListOrdered, cmd: 'insertOrderedList', label: 'Numbered list' },
    { icon: Quote, cmd: 'formatBlock', arg: '<blockquote>', label: 'Quote' },
    { icon: Code, cmd: 'formatBlock', arg: '<pre>', label: 'Code' },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.label}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => exec(t.cmd, t.arg)}
              title={t.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec('undo')} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => exec('redo')} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => {
            const url = window.prompt('Link URL');
            if (url) exec('createLink', url);
          }}
        >
          <LinkIcon className="h-4 w-4" /> Link
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        className={cn(
          'rte-content min-h-[220px] max-w-none px-4 py-3 text-sm text-foreground outline-none',
          '[&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]',
        )}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}