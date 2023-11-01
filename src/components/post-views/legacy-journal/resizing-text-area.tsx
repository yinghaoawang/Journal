import {
  useEffect,
  type ChangeEvent,
  type SetStateAction,
  type Dispatch,
  useRef
} from 'react';

export const resizeTextArea = (
  textArea: HTMLTextAreaElement | null | undefined
) => {
  if (textArea == null) return;
  const prevScrollX = window.scrollX;
  const prevScrollY = window.scrollY;

  textArea.style.height = 'auto';
  textArea.style.height = textArea.scrollHeight + 'px';

  window.scrollTo(prevScrollX, prevScrollY);
};

const AutoResizingTextArea = ({
  input,
  setInput,
  disabled,
  className
}: {
  input?: string;
  setInput?: Dispatch<SetStateAction<string>>;
  disabled?: boolean;
  className?: string;
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateDimensions = () => {
    resizeTextArea(textAreaRef?.current);
  };

  useEffect(() => {
    updateDimensions();
  }, [textAreaRef]);

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <textarea
      ref={textAreaRef}
      rows={10}
      className={className}
      value={input}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        resizeTextArea(event.target);
        if (setInput) setInput(event.target.value);
      }}
      disabled={disabled}
    />
  );
};

export default AutoResizingTextArea;
