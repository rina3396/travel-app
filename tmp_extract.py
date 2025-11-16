from pathlib import Path
text = Path('app/trips/new/page.tsx').read_text(encoding='utf-8')
start = text.index('{step === 4')
end = text.index('{step === 5')
print(text[start:end])
