type Props = { text: string };

export default function Label({ text }: Props) {
  return <span class="label">{text}</span>;
}
