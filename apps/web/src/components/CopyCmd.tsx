import { Fragment, type ReactNode } from 'react';
import { useT } from '../lib/lang';
import { type CopyKey, useSite } from '../lib/site';

// A copy button beside a command or a snippet; it reads "copied", in the link blue, for a moment after its copy. The command beside it ellipsizes or wraps, so the button keeps its width: in a phone's row its "copied" label used to wrap onto two lines. Below md, or with a coarse pointer (a tablet, a phone held sideways), it grows to 40px, the smallest touch target the phone layout allows. `small` is the size on an entry card's setup line.
export function CopyButton({ text, copyKey, label, small = false }: { text: string; copyKey: CopyKey; label: string; small?: boolean }) {
	const t = useT();
	const { copy, copied } = useSite();
	const size = small ? 'min-h-7 min-w-14 px-2.5 text-[12px]' : 'min-h-9 min-w-[72px] px-3 text-[13px]';
	const done = copied === copyKey;
	return (
		<button type='button' className={`flex-none rounded-[9px] border border-line-2 bg-panel py-0 font-semibold whitespace-nowrap transition-[background,color] duration-150 hover:bg-soft max-md:min-h-10 pointer-coarse:min-h-10 ${done ? 'text-blue-ink' : 'text-fg-2 hover:text-fg'} ${size}`} onClick={() => copy(text, copyKey)} aria-label={label}>
			{done ? t.copied : t.copy}
		</button>
	);
}

// A command's row: the command, then its copy button, in a soft well. A plugin's CLI commands and an entry card's setup lines draw the same box.
export const cmdRow = 'flex min-h-[42px] items-center gap-3 rounded-box border border-line-2 bg-soft py-1 pr-1 pl-4';

type CommandToken = { start: number; end: number; className?: string };

// The commands on the catalog cards are short and static, so a small lexer keeps their important parts readable without shipping a syntax-highlighting dependency. It recognizes the executable, subcommands, flags, flag values and module or package paths.
function commandTokens(text: string): CommandToken[] {
	const tokens: CommandToken[] = [];
	const pattern = /\S+|\s+/g;
	let match: RegExpExecArray | null;
	let wordIndex = 0;
	let previousWord = '';
	while ((match = pattern.exec(text))) {
		const value = match[0];
		if (/\s+/.test(value)) {
			tokens.push({ start: match.index, end: match.index + value.length });
			continue;
		}
		let className = 'cmd-arg';
		if (wordIndex === 0) className = 'cmd-bin';
		else if (value.startsWith('-')) className = 'cmd-flag';
		else if (previousWord.startsWith('-')) className = 'cmd-value';
		else if (value.includes('/') || value.includes('@') || /^https?:\/\//.test(value)) className = 'cmd-path';
		tokens.push({ start: match.index, end: match.index + value.length, className });
		previousWord = value;
		wordIndex++;
	}
	return tokens;
}

function highlightedCommand(text: string, start: number, end: number, tokens: readonly CommandToken[]): ReactNode {
	return tokens.map((token, i) => {
		const from = Math.max(start, token.start);
		const to = Math.min(end, token.end);
		if (from >= to) return null;
		const value = text.slice(from, to);
		return token.className ? <span key={`${i}-${from}`} className={token.className}>{value}</span> : <Fragment key={`${i}-${from}`}>{value}</Fragment>;
	});
}

function CommandCode({ head, tail }: { head: string; tail: string }) {
	const text = head + tail;
	const tokens = commandTokens(text);
	return (
		<code className='flex min-w-0 flex-auto font-mono text-[12.5px] whitespace-pre' lang='en'>
			<span className='min-w-0 overflow-hidden text-ellipsis'>{highlightedCommand(text, 0, head.length, tokens)}</span>
			<span className='flex-none'>{highlightedCommand(text, head.length, text.length, tokens)}</span>
		</code>
	);
}

// An entry card's setup line (a plugin's Go import or package, a state solution's install command) with its copy button. `tail` is the part that tells the lines apart, which stays whole while `head` gives way to an ellipsis on a narrow card. No $ prompt: an import line is not a shell command.
export function SetupLine({ head, tail, copyKey }: { head: string; tail: string; copyKey: CopyKey }) {
	const t = useT();
	const text = head + tail;
	return (
		<div className={cmdRow}>
			<CommandCode head={head} tail={tail} />
			<CopyButton text={text} copyKey={copyKey} label={`${t.copy}: ${text}`} small />
		</div>
	);
}
