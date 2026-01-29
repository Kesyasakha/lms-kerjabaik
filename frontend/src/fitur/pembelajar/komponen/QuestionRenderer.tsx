import { RadioGroup, RadioGroupItem } from '@/komponen/ui/radio-group';
import { Checkbox } from '@/komponen/ui/checkbox';
import { Textarea } from '@/komponen/ui/textarea';
import { Input } from '@/komponen/ui/input';
import { Label } from '@/komponen/ui/label';
import { Card, CardContent } from '@/komponen/ui/card';
import { AlertCircle } from 'lucide-react';
import type { Question, QuestionOption } from '../tipe';

interface QuestionRendererProps {
    question: Question;
    answer?: string | string[];
    onAnswerChange: (answer: string | string[]) => void;
    disabled?: boolean;
    showCorrectAnswer?: boolean;
    variant?: 'default' | 'plain';
}

export function QuestionRenderer({
    question,
    answer,
    onAnswerChange,
    disabled = false,
    showCorrectAnswer = false,
    variant = 'default'
}: QuestionRendererProps) {
    const parseOptions = (opsi: any): QuestionOption[] => {
        let options: QuestionOption[] = [];
        if (!opsi) return [];

        try {
            let parsed = opsi;

            // Try parsing if string (handle potential double-stringification)
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    // ignore parse error, use original string
                }
            }
            // Second pass for double stringified JSON (common in some CSV imports)
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    // ignore
                }
            }

            if (Array.isArray(parsed)) {
                options = parsed.map((opt: any, idx: number) => {
                    // Handle simple string/number array ["A", "B"]
                    if (typeof opt === 'string' || typeof opt === 'number') {
                        return {
                            key: `${idx}`,
                            value: String(opt),
                            benar: false
                        };
                    }
                    // Handle object {key: 'a', value: 'b'}
                    return {
                        key: String(opt.key || opt.code || idx),
                        value: String(opt.value || opt.text || opt.label || JSON.stringify(opt)),
                        benar: !!(opt.benar || opt.isCorrect)
                    };
                });
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Check if the object WRAPS the actual array (common mistake)
                // e.g. { "opsi": [...] } or { "pilihan": [...] }
                const possibleArray = parsed.opsi || parsed.options || parsed.pilihan || parsed.choices || parsed.data;
                if (Array.isArray(possibleArray)) {
                    // Recurse or just handle logic here. Let's duplichate the array logic for safety without recursion limit
                    options = possibleArray.map((opt: any, idx: number) => {
                        if (typeof opt === 'string' || typeof opt === 'number') {
                            return { key: `${idx}`, value: String(opt), benar: false };
                        }
                        return {
                            key: String(opt.key || opt.code || idx),
                            value: String(opt.value || opt.text || opt.label || JSON.stringify(opt)),
                            benar: !!(opt.benar || opt.isCorrect)
                        };
                    });
                } else {
                    // Handle genuine object map {"a": "Text", "b": "Text2"}
                    options = Object.entries(parsed).map(([k, v]: [string, any]) => {
                        let val = '';
                        let isCorrect = false;

                        if (typeof v === 'object' && v !== null) {
                            val = v.value || v.text || v.label || JSON.stringify(v);
                            isCorrect = !!v.benar;
                        } else {
                            val = String(v);
                        }

                        return {
                            key: k,
                            value: val,
                            benar: isCorrect
                        };
                    });
                }
            }
        } catch (e) {
            console.error('Error parsing options:', e);
            return [];
        }

        return options;
    };

    const renderPilihanGanda = () => {
        const options = parseOptions(question.opsi);

        // Debug fallback: If somehow we still get 1 compressed option or 0, show Raw Data
        if (!options || options.length < 2) {
            console.warn('Suspicious options count:', options.length, question.opsi);
            return (
                <div className="space-y-4">
                    <div className="text-red-500 font-bold">
                        Warning: Format opsi soal tidak dikenali (Ditemukan {options.length} opsi).
                    </div>
                    {options.length > 0 && (
                        <RadioGroup className="space-y-3" disabled>
                            {options.map((option) => (
                                <div key={option.key} className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50">
                                    {/* Show what we parsed to verify */}
                                    <RadioGroupItem value={option.key} id={`bad-${option.key}`} />
                                    <Label>{option.value}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                    <details className="mt-2 text-xs bg-slate-100 p-2 rounded">
                        <summary className="cursor-pointer font-medium mb-1">Lihat Raw Data (Untuk Debugging)</summary>
                        <pre className="whitespace-pre-wrap text-slate-700">
                            {typeof question.opsi === 'string' ? question.opsi : JSON.stringify(question.opsi, null, 2)}
                        </pre>
                    </details>
                </div>
            );
        }

        return (
            <RadioGroup
                value={answer as string}
                onValueChange={onAnswerChange}
                disabled={disabled}
                className="grid gap-2.5"
            >
                {options.map((option) => (
                    <div
                        key={option.key}
                        className={`group flex items-center space-x-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${showCorrectAnswer && option.benar
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/50 shadow-sm'
                            : showCorrectAnswer && answer === option.key && !option.benar
                                ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-500/50 shadow-sm'
                                : answer === option.key
                                    ? 'bg-violet-50/50 dark:bg-violet-900/10 border-violet-500/50 shadow-sm ring-1 ring-violet-500/20'
                                    : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-violet-200 dark:hover:border-violet-900/50 hover:bg-violet-50/30'
                            }`}
                        onClick={() => !disabled && onAnswerChange(option.key)}
                    >
                        <RadioGroupItem
                            value={option.key}
                            id={`option-${option.key}`}
                            className="shrink-0 text-violet-600 border-gray-300"
                        />
                        <Label
                            htmlFor={`option-${option.key}`}
                            className="flex-1 cursor-pointer font-semibold text-sm leading-relaxed text-gray-700 dark:text-zinc-300"
                        >
                            {option.value}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        );
    };

    const renderPilihanGandaMultiple = () => {
        const options = parseOptions(question.opsi);
        const selectedAnswers = (answer as string[]) || [];

        if (!options || options.length === 0) {
            console.warn('No options found for question:', question.id, question.opsi);
        }

        const handleCheckboxChange = (optionKey: string, checked: boolean) => {
            if (checked) {
                onAnswerChange([...selectedAnswers, optionKey]);
            } else {
                onAnswerChange(selectedAnswers.filter(a => a !== optionKey));
            }
        };

        return (
            <div className="grid gap-2.5">
                {options.map((option) => (
                    <div
                        key={option.key}
                        className={`group flex items-center space-x-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${showCorrectAnswer && option.benar
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/50 shadow-sm'
                            : showCorrectAnswer && selectedAnswers.includes(option.key) && !option.benar
                                ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-500/50 shadow-sm'
                                : selectedAnswers.includes(option.key)
                                    ? 'bg-violet-50/50 dark:bg-violet-900/10 border-violet-500/50 shadow-sm ring-1 ring-violet-500/20'
                                    : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-violet-200 dark:hover:border-violet-900/50 hover:bg-violet-50/30'
                            }`}
                        onClick={() => !disabled && handleCheckboxChange(option.key, !selectedAnswers.includes(option.key))}
                    >
                        <Checkbox
                            id={`option-${option.key}`}
                            checked={selectedAnswers.includes(option.key)}
                            onCheckedChange={(checked) => handleCheckboxChange(option.key, checked as boolean)}
                            disabled={disabled}
                            className="shrink-0 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <Label
                            htmlFor={`option-${option.key}`}
                            className="flex-1 cursor-pointer font-semibold text-sm leading-relaxed text-gray-700 dark:text-zinc-300"
                        >
                            {option.value}
                        </Label>
                    </div>
                ))}
            </div>
        );
    };

    const renderBenarSalah = () => {
        return (
            <RadioGroup
                value={answer as string}
                onValueChange={onAnswerChange}
                disabled={disabled}
                className="grid gap-3"
            >
                <div
                    className={`group flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${showCorrectAnswer && question.jawaban_benar === 'benar'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm'
                        : showCorrectAnswer && answer === 'benar' && question.jawaban_benar !== 'benar'
                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 shadow-sm'
                            : answer === 'benar'
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'border-transparent bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                    onClick={() => !disabled && onAnswerChange('benar')}
                >
                    <RadioGroupItem value="benar" id="option-benar" className="shrink-0" />
                    <Label htmlFor="option-benar" className="flex-1 cursor-pointer font-bold text-sm text-gray-700 dark:text-zinc-200">
                        Benar
                    </Label>
                </div>
                <div
                    className={`group flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${showCorrectAnswer && question.jawaban_benar === 'salah'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm'
                        : showCorrectAnswer && answer === 'salah' && question.jawaban_benar !== 'salah'
                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 shadow-sm'
                            : answer === 'salah'
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'border-transparent bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                    onClick={() => !disabled && onAnswerChange('salah')}
                >
                    <RadioGroupItem value="salah" id="option-salah" className="shrink-0" />
                    <Label htmlFor="option-salah" className="flex-1 cursor-pointer font-bold text-sm text-gray-700 dark:text-zinc-200">
                        Salah
                    </Label>
                </div>
            </RadioGroup>
        );
    };

    const renderIsianSingkat = () => {
        return (
            <Input
                value={answer as string || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={disabled}
                placeholder="Ketik jawaban Anda di sini..."
                className={`h-12 rounded-xl focus-visible:ring-primary/20 ${showCorrectAnswer
                    ? answer === question.jawaban_benar
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-rose-500 bg-rose-50/50'
                    : 'border-border/60 bg-zinc-50/50'
                    }`}
            />
        );
    };

    const renderEsai = () => {
        return (
            <Textarea
                value={answer as string || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={disabled}
                placeholder="Tuliskan analisis atau jawaban esai Anda secara lengkap..."
                rows={8}
                className="resize-none rounded-2xl border-border/60 bg-zinc-50/50 focus-visible:ring-primary/20 p-6 leading-relaxed"
            />
        );
    };

    const content = (
        <div className={`space-y-6 ${variant === 'default' ? 'p-8' : 'p-0'}`}>
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">Pertanyaan</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-zinc-100 leading-snug whitespace-pre-wrap">{question.pertanyaan}</p>
                </div>
                <div className="shrink-0 pt-1">
                    <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-sm">
                        {question.poin} Poin
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {question.tipe === 'pilihan_ganda' && renderPilihanGanda()}
                {question.tipe === 'pilihan_ganda_multiple' && renderPilihanGandaMultiple()}
                {question.tipe === 'benar_salah' && renderBenarSalah()}
                {question.tipe === 'isian_singkat' && renderIsianSingkat()}
                {question.tipe === 'esai' && renderEsai()}
            </div>

            {showCorrectAnswer && question.penjelasan && (
                <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                            Penjelasan Pembahasan
                        </p>
                    </div>
                    <p className="text-sm font-medium text-blue-900/80 dark:text-blue-200/80 leading-relaxed italic">
                        {question.penjelasan}
                    </p>
                </div>
            )}
        </div>
    );

    if (variant === 'plain') {
        return content;
    }

    return (
        <Card className="rounded-2xl shadow-none border-border/60 overflow-hidden bg-white dark:bg-zinc-950">
            <CardContent className="p-0">
                {content}
            </CardContent>
        </Card>
    );
}
