interface LinkedTextProps {
  children: string
}

/** Keep URLs as text nodes and anchors; never interpret guide copy as HTML. */
export function LinkedText({ children }: LinkedTextProps) {
  const parts = children.split(/((?:https?:\/\/)?chatgpt\.com(?:\/[a-zA-Z0-9/_?=&%#.-]*)?)/g)

  return <>{parts.map((part, index) => index % 2 === 1
    ? <a key={index} className="inline-url" href={part.startsWith('http') ? part : `https://${part}`} target="_blank" rel="noopener noreferrer">{part}</a>
    : part)}</>
}
