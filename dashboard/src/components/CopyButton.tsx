import { useState, type ReactElement } from 'react';

export function CopyButton({ text }: { text: string }): ReactElement {
    const [copied, setCopied] = useState(false);

    function handleCopy(): void {
        void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <button
            onClick={handleCopy}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}
