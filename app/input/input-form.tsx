"use client";

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  MapPin,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FieldLabel } from "@/components/form/field-label";
import { FormSectionCard } from "@/components/form/form-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "content", label: "内容信息", short: "内容" },
  { id: "show", label: "演出信息", short: "演出" },
  { id: "audience", label: "目标受众", short: "受众" },
  { id: "goal", label: "商业目标", short: "商业" },
] as const;

const PLAY_TYPES = ["话剧", "沉浸式", "音乐剧", "舞蹈剧场", "儿童剧", "脱口秀"];
const MOODS = ["治愈", "烧脑", "爆笑", "沉重", "浪漫"];
const COPYRIGHT_OPTIONS = [
  { value: "原创", title: "原创", desc: "从零开始的本土故事" },
  { value: "改编", title: "改编", desc: "源自经典文本、电影或他人 IP" },
  { value: "引进", title: "引进", desc: "海外作品的中文制作版" },
] as const;
const BACKING_TYPES = [
  "奖项",
  "入围",
  "资助",
  "媒体推荐",
  "名家推荐",
  "巡演纪录",
  "其他",
];
const CITIES = ["上海", "北京", "成都", "广州", "深圳", "其他"];
const SHOW_TIMES = ["周末晚场", "工作日晚场", "下午场", "全天"];
const PRICE_TIERS = [
  "学生票<100",
  "普通票 100-300",
  "高端票 300-600",
  "VIP>600",
];
const DECISION_PATHS = ["独自购买", "情侣约会", "朋友聚会", "亲子"];
const PRIORITIES = ["上座率优先", "媒体声量优先", "口碑沉淀", "招商赞助"];
const BUDGET_TIERS = ["3万以内", "3-10万", "10-30万", "30万以上"] as const;
const AVOID_CHIPS = [
  '别打"女性主义"标签',
  "别强调悬疑反转",
  '别走"小众实验"路线',
  "别拿 IP 联动作主卖点",
  "别让导演 IP 盖过主演",
  "不要提及任何政治敏感议题",
  '别用"治愈/疗愈"这种泛词',
];

const PLAN_ITEMS = [
  { title: "受众洞察报告", sub: "七问框架画像" },
  { title: "渠道策略方案", sub: "ABC 三层模型" },
  { title: "小红书内容包", sub: "5 篇可直接发布" },
  { title: "60 天执行日历", sub: "T-60 倒计时排期" },
  { title: "卖点话术清单", sub: "购票转化文案" },
];

const fieldClass =
  "h-11 rounded-xl border-stage-border bg-white/80 text-base shadow-none focus-visible:border-berry focus-visible:ring-berry/20";

type BackingEntry = { id: string; type: string; name: string; year: string };
type TicketTier = { id: string; price: string; percentage: string; note: string };

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <Select value={value || null} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger className={cn(fieldClass, "w-full")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RadioCards({
  value,
  onChange,
  options,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  accent: "teal" | "coral" | "berry";
}) {
  const ring: Record<typeof accent, string> = {
    teal: "has-data-checked:border-accent-teal has-data-checked:bg-accent-teal/8",
    coral: "has-data-checked:border-accent-coral has-data-checked:bg-accent-coral/8",
    berry: "has-data-checked:border-berry has-data-checked:bg-pink-mist",
  };

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <Label
          key={opt}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-stage-border bg-white px-4 py-3.5 transition hover:border-berry/25",
            ring[accent]
          )}
        >
          <RadioGroupItem value={opt} />
          <span className="text-sm font-medium text-ink">{opt}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

function CopyrightRadioCards({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid gap-3 sm:grid-cols-3"
    >
      {COPYRIGHT_OPTIONS.map((opt) => (
        <Label
          key={opt.value}
          className={cn(
            "flex cursor-pointer flex-col gap-2 rounded-xl border border-stage-border bg-white px-4 py-4 transition hover:border-berry/25",
            "has-data-checked:border-accent-yellow has-data-checked:bg-accent-yellow/10"
          )}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} />
            <span className="text-sm font-semibold text-ink">{opt.title}</span>
          </div>
          <p className="pl-6 text-xs leading-relaxed text-ink-mute">{opt.desc}</p>
        </Label>
      ))}
    </RadioGroup>
  );
}

function BudgetCards({
  value,
  onChange,
  customValue,
  onCustomChange,
}: {
  value: string;
  onChange: (v: string) => void;
  customValue: string;
  onCustomChange: (v: string) => void;
}) {
  const allOptions = [...BUDGET_TIERS, "自定义"] as const;

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {allOptions.map((opt) => (
          <Label
            key={opt}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-stage-border bg-white px-4 py-3.5 transition hover:border-berry/25",
              "has-data-checked:border-berry has-data-checked:bg-pink-mist"
            )}
          >
            <RadioGroupItem value={opt} />
            <span className="text-sm font-medium text-ink">
              {opt === "自定义" ? "自定义（更精准）" : opt}
            </span>
          </Label>
        ))}
      </RadioGroup>
      {value === "自定义" && (
        <Input
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="例：预算约 15 万，含小红书 + 线下地推"
          className={fieldClass}
        />
      )}
      <p className="text-xs text-ink-mute">
        这个数字不会写进任何对外文案，只用于内部匹配。
      </p>
    </div>
  );
}

export function InputForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const [playName, setPlayName] = useState("");
  const [playType, setPlayType] = useState("");
  const [copyright, setCopyright] = useState("");
  const [adaptSource, setAdaptSource] = useState("");
  const [importOrigin, setImportOrigin] = useState("");
  const [mood, setMood] = useState("");
  const [highlights, setHighlights] = useState("");
  const [backingEntries, setBackingEntries] = useState<BackingEntry[]>([]);
  const [benchmarkTitle, setBenchmarkTitle] = useState("");
  const [benchmarkVenue, setBenchmarkVenue] = useState("");
  const [benchmarkVersion, setBenchmarkVersion] = useState("");
  const [benchmarkSimilarity, setBenchmarkSimilarity] = useState("");

  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [showTime, setShowTime] = useState("");
  const [showCount, setShowCount] = useState("");
  const [seatCount, setSeatCount] = useState("");
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: newId(), price: "", percentage: "", note: "" },
  ]);

  const [audience, setAudience] = useState("");
  const [priceTier, setPriceTier] = useState("");
  const [decisionPath, setDecisionPath] = useState("");

  const [priority, setPriority] = useState("");
  const [marketingBudget, setMarketingBudget] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [avoidDirections, setAvoidDirections] = useState("");

  const benchmarkPreview = useMemo(() => {
    const parts = [
      benchmarkTitle && `《${benchmarkTitle.replace(/^《|》$/g, "")}》`,
      benchmarkVenue,
      benchmarkVersion,
      benchmarkSimilarity,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : "";
  }, [benchmarkTitle, benchmarkVenue, benchmarkVersion, benchmarkSimilarity]);

  const hasValidTicketTier = ticketTiers.some((t) => t.price.trim());

  const sectionDone = useMemo(
    () => [
      Boolean(playName && playType && copyright && mood),
      Boolean(city && venue && showTime && showCount && seatCount && hasValidTicketTier),
      Boolean(audience && priceTier && decisionPath),
      Boolean(
        priority &&
          marketingBudget &&
          (marketingBudget !== "自定义" || customBudget.trim())
      ),
    ],
    [
      playName,
      playType,
      copyright,
      mood,
      city,
      venue,
      showTime,
      showCount,
      seatCount,
      hasValidTicketTier,
      audience,
      priceTier,
      decisionPath,
      priority,
      marketingBudget,
      customBudget,
    ]
  );

  const completedCount = sectionDone.filter(Boolean).length;
  const progressValue = (completedCount / 4) * 100;

  const handleSubmit = () => {
    // 把所有表单字段打包成 4 个维度的对象
    const payload = {
      content: {
        playName,
        playType,
        copyright,
        adaptSource,
        importOrigin,
        mood,
        highlights,
        backingEntries,
        benchmark: {
          title: benchmarkTitle,
          venue: benchmarkVenue,
          version: benchmarkVersion,
          similarity: benchmarkSimilarity,
        },
      },
      show: {
        city,
        venue,
        showTime,
        showCount,
        seatCount,
        ticketTiers,
      },
      audience: {
        targetAudience: audience,
        priceTier,
        decisionPath,
      },
      business: {
        priority,
        marketingBudget,
        customBudget,
        avoidDirections,
      },
    };

    // 清掉上次生成的结果,这样 /result 会重新调 API 生成新方案
    sessionStorage.removeItem("stage-os-result");
    // 把表单数据塞进 sessionStorage,/result 页面会读出来当请求体
    sessionStorage.setItem("stage-os-form-data", JSON.stringify(payload));
    router.push("/result");
  };

  const goToStep = (index: number) => setActiveStep(index);

  const nextStep = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const addBackingEntry = () => {
    setBackingEntries((prev) => [
      ...prev,
      { id: newId(), type: "奖项", name: "", year: "" },
    ]);
  };

  const updateBackingEntry = (id: string, patch: Partial<BackingEntry>) => {
    setBackingEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  const removeBackingEntry = (id: string) => {
    setBackingEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addTicketTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { id: newId(), price: "", percentage: "", note: "" },
    ]);
  };

  const updateTicketTier = (id: string, patch: Partial<TicketTier>) => {
    setTicketTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const removeTicketTier = (id: string) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const appendAvoidChip = (chip: string) => {
    setAvoidDirections((prev) => {
      if (!prev.trim()) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev.trimEnd()}\n${chip}`;
    });
  };

  const handleCopyrightChange = (v: string) => {
    setCopyright(v);
    if (v !== "改编") setAdaptSource("");
    if (v !== "引进") setImportOrigin("");
  };

  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader ctaHref="/result" />

      <section className="relative overflow-hidden bg-berry px-5 pb-10 pt-8 text-white sm:px-8">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-accent-yellow/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-accent-teal/10 blur-2xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl">
          <p className="flex items-center justify-center gap-2 text-sm text-pink-pale/90">
            <Sparkles className="h-4 w-4 text-accent-yellow" />
            填写剧目信息
          </p>
          <h1 className="mt-3 text-center font-serif text-3xl font-bold sm:text-4xl">
            四维信息，30 秒出方案。
          </h1>
          <p className="mt-2 text-center text-sm text-pink-pale/85 sm:text-base">
            每一项都有意义——填得越准，方案越咬合。
          </p>

          <div className="relative mx-auto mt-10 max-w-2xl px-4 sm:max-w-3xl">
            <ol className="flex w-full items-start">
              {STEPS.map((step, i) => {
                const done = sectionDone[i];
                const isCurrent = activeStep === i;
                return (
                  <Fragment key={step.id}>
                    <li className="flex shrink-0 flex-col items-center">
                      <button
                        type="button"
                        onClick={() => goToStep(i)}
                        className={cn(
                          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition sm:h-11 sm:w-11",
                          done
                            ? "bg-accent-teal text-white"
                            : isCurrent
                              ? "bg-white text-berry"
                              : "bg-white/25 text-white/80 hover:bg-white/40"
                        )}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {done ? "✓" : i + 1}
                      </button>
                      <span
                        className={cn(
                          "mt-2 hidden text-center text-xs sm:block",
                          isCurrent ? "font-medium text-white" : "text-white/60"
                        )}
                      >
                        {step.label}
                      </span>
                    </li>
                    {i < STEPS.length - 1 && (
                      <li
                        className="flex min-w-4 flex-1 items-center self-start pt-[18px] sm:pt-[22px]"
                        aria-hidden
                      >
                        <div className="h-0.5 w-full bg-white/30" />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-6xl px-5 py-10 font-sans sm:px-8">
        <div
          className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-pink-pale/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-40 left-0 h-48 w-48 rounded-full bg-accent-coral/8 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <FormSectionCard
              id="content"
              step="第一部分"
              title="内容信息"
              description="剧目是什么、讲什么、打动谁"
              accent="yellow"
              icon={<BookOpen className="h-5 w-5" />}
              isOpen={activeStep === 0}
              isComplete={sectionDone[0]}
              onOpen={() => goToStep(0)}
              onNext={nextStep}
              nextLabel="下一步：演出信息"
            >
              <div className="space-y-2">
                <FieldLabel htmlFor="playName" required>
                  剧目名称
                </FieldLabel>
                <Input
                  id="playName"
                  value={playName}
                  onChange={(e) => setPlayName(e.target.value)}
                  placeholder="例：《候鸟来的那天》"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel required>剧目类型</FieldLabel>
                <SelectField
                  value={playType}
                  onChange={setPlayType}
                  placeholder="选择剧目类型"
                  options={PLAY_TYPES}
                />
              </div>

              <div className="space-y-3">
                <FieldLabel required>版权属性</FieldLabel>
                <CopyrightRadioCards value={copyright} onChange={handleCopyrightChange} />
                {copyright === "改编" && (
                  <div className="rounded-xl border border-accent-yellow/40 bg-accent-yellow/5 p-4">
                    <FieldLabel htmlFor="adaptSource">原作来源</FieldLabel>
                    <Input
                      id="adaptSource"
                      value={adaptSource}
                      onChange={(e) => setAdaptSource(e.target.value)}
                      placeholder="如：张爱玲《半生缘》"
                      className={cn(fieldClass, "mt-2")}
                    />
                  </div>
                )}
                {copyright === "引进" && (
                  <div className="rounded-xl border border-accent-yellow/40 bg-accent-yellow/5 p-4">
                    <FieldLabel htmlFor="importOrigin">原版国家与剧团</FieldLabel>
                    <Input
                      id="importOrigin"
                      value={importOrigin}
                      onChange={(e) => setImportOrigin(e.target.value)}
                      placeholder="如：英国 · 国家剧院"
                      className={cn(fieldClass, "mt-2")}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel required>情绪基调</FieldLabel>
                <SelectField
                  value={mood}
                  onChange={setMood}
                  placeholder="选择情绪基调"
                  options={MOODS}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="highlights">主创亮点</FieldLabel>
                <Textarea
                  id="highlights"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="导演/演员/编舞/音乐等亮点，以及与其他剧目的差异点…"
                  className="min-h-[120px] rounded-xl border-stage-border bg-white/80 text-base focus-visible:border-berry focus-visible:ring-berry/20"
                />
              </div>

              <div className="space-y-3">
                <FieldLabel>结构化背书 / 获奖</FieldLabel>
                <p className="text-xs text-ink-mute -mt-1">
                  主创亮点是软描述，这里是硬证据——奖项、资助、媒体推荐等。
                </p>
                {backingEntries.length > 0 && (
                  <div className="space-y-3">
                    {backingEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-3 rounded-xl border border-stage-border bg-white/80 p-4 sm:flex-row sm:items-end"
                      >
                        <div className="space-y-1.5 sm:w-32 shrink-0">
                          <span className="text-xs text-ink-mute">类型</span>
                          <Select
                            value={entry.type}
                            onValueChange={(v) =>
                              updateBackingEntry(entry.id, { type: v ?? "奖项" })
                            }
                          >
                            <SelectTrigger className={fieldClass}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BACKING_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <span className="text-xs text-ink-mute">名称</span>
                          <Input
                            value={entry.name}
                            onChange={(e) =>
                              updateBackingEntry(entry.id, { name: e.target.value })
                            }
                            placeholder="国家艺术基金青年艺术创作人才资助项目"
                            className={fieldClass}
                          />
                        </div>
                        <div className="space-y-1.5 sm:w-24 shrink-0">
                          <span className="text-xs text-ink-mute">年份（可选）</span>
                          <Input
                            value={entry.year}
                            onChange={(e) =>
                              updateBackingEntry(entry.id, { year: e.target.value })
                            }
                            placeholder="2024"
                            className={fieldClass}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBackingEntry(entry.id)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stage-border text-ink-mute transition hover:border-accent-coral hover:text-accent-coral"
                          aria-label="删除此条"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBackingEntry}
                  className="h-10 rounded-xl border-dashed border-stage-border text-ink-soft hover:border-berry/30 hover:text-berry"
                >
                  <Plus className="h-4 w-4" />
                  再加一条
                </Button>
                <p className="text-xs leading-relaxed text-ink-mute">
                  没有获奖也没关系——主创亮点已经够用了。可跳过。
                </p>
              </div>

              <div className="space-y-3">
                <FieldLabel>对标剧目</FieldLabel>
                <p className="text-xs text-ink-mute -mt-1">
                  按框架填写，我们会拼成一条完整参考：
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={benchmarkTitle}
                    onChange={(e) => setBenchmarkTitle(e.target.value)}
                    placeholder="剧目名，如：暗恋桃花源"
                    className={fieldClass}
                  />
                  <Input
                    value={benchmarkVenue}
                    onChange={(e) => setBenchmarkVenue(e.target.value)}
                    placeholder="场馆，如：上海大剧院"
                    className={fieldClass}
                  />
                  <Input
                    value={benchmarkVersion}
                    onChange={(e) => setBenchmarkVersion(e.target.value)}
                    placeholder="版本，如：2023 巡演版"
                    className={fieldClass}
                  />
                  <Input
                    value={benchmarkSimilarity}
                    onChange={(e) => setBenchmarkSimilarity(e.target.value)}
                    placeholder="相似点，如：同样讲家庭"
                    className={fieldClass}
                  />
                </div>
                {benchmarkPreview && (
                  <p className="rounded-xl bg-stage-bg px-4 py-3 text-sm text-ink-soft">
                    <span className="text-xs text-ink-mute">预览：</span>
                    {benchmarkPreview}
                  </p>
                )}
              </div>
            </FormSectionCard>

            <FormSectionCard
              id="show"
              step="第二部分"
              title="演出信息"
              description="在哪里演、什么时候、什么价位"
              accent="teal"
              icon={<MapPin className="h-5 w-5" />}
              isOpen={activeStep === 1}
              isComplete={sectionDone[1]}
              onOpen={() => goToStep(1)}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev
              nextLabel="下一步：目标受众"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel required>城市</FieldLabel>
                  <SelectField
                    value={city}
                    onChange={setCity}
                    placeholder="选择城市"
                    options={CITIES}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel required>演出时段</FieldLabel>
                  <SelectField
                    value={showTime}
                    onChange={setShowTime}
                    placeholder="选择时段"
                    options={SHOW_TIMES}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="venue" required>
                  具体场地
                </FieldLabel>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="如：安福路话剧艺术中心"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-3">
                <FieldLabel required>演出体量</FieldLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={showCount}
                      onChange={(e) => setShowCount(e.target.value)}
                      placeholder="5"
                      className={cn(fieldClass, "pr-12")}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
                      场
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={seatCount}
                      onChange={(e) => setSeatCount(e.target.value)}
                      placeholder="200"
                      className={cn(fieldClass, "pr-12")}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
                      座
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <FieldLabel required>票价档位</FieldLabel>
                <div className="space-y-3">
                  {ticketTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex flex-col gap-3 rounded-xl border border-stage-border bg-white/80 p-4 sm:flex-row sm:items-end"
                    >
                      <div className="relative sm:w-28 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          value={tier.price}
                          onChange={(e) =>
                            updateTicketTier(tier.id, { price: e.target.value })
                          }
                          placeholder="180"
                          className={cn(fieldClass, "pr-10")}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
                          元
                        </span>
                      </div>
                      <div className="relative sm:w-24 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={tier.percentage}
                          onChange={(e) =>
                            updateTicketTier(tier.id, { percentage: e.target.value })
                          }
                          placeholder="60"
                          className={cn(fieldClass, "pr-10")}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
                          %
                        </span>
                      </div>
                      <div className="flex-1">
                        <Input
                          value={tier.note}
                          onChange={(e) =>
                            updateTicketTier(tier.id, { note: e.target.value })
                          }
                          placeholder="如：学生票 / 普通票 / 1-3 排 / VIP"
                          className={fieldClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTicketTier(tier.id)}
                        disabled={ticketTiers.length <= 1}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stage-border text-ink-mute transition hover:border-accent-coral hover:text-accent-coral disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="删除此档"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTicketTier}
                  className="h-10 rounded-xl border-dashed border-stage-border text-ink-soft hover:border-accent-teal/40 hover:text-accent-teal"
                >
                  <Plus className="h-4 w-4" />
                  再加一档
                </Button>
              </div>
            </FormSectionCard>

            <FormSectionCard
              id="audience"
              step="第三部分"
              title="目标受众"
              description="她是谁？为什么今晚会出门看戏？"
              accent="coral"
              icon={<Users className="h-5 w-5" />}
              isOpen={activeStep === 2}
              isComplete={sectionDone[2]}
              onOpen={() => goToStep(2)}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev
              nextLabel="下一步：商业目标"
            >
              <div className="space-y-2">
                <FieldLabel htmlFor="audience" required>
                  主受众画像
                </FieldLabel>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="如：25-32 岁上海女性白领"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel required>客单价定位</FieldLabel>
                <SelectField
                  value={priceTier}
                  onChange={setPriceTier}
                  placeholder="选择票价区间"
                  options={PRICE_TIERS}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel required>决策路径</FieldLabel>
                <RadioCards
                  value={decisionPath}
                  onChange={setDecisionPath}
                  options={DECISION_PATHS}
                  accent="coral"
                />
              </div>
            </FormSectionCard>

            <FormSectionCard
              id="goal"
              step="第四部分"
              title="商业目标"
              description="这次演出，你最想实现什么？"
              accent="berry"
              icon={<Target className="h-5 w-5" />}
              isOpen={activeStep === 3}
              isComplete={sectionDone[3]}
              onOpen={() => goToStep(3)}
              onPrev={prevStep}
              showPrev
              isLast
              onNext={() => {
                document
                  .querySelector("[data-submit-bar]")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="space-y-2">
                <FieldLabel required>优先级</FieldLabel>
                <RadioCards
                  value={priority}
                  onChange={setPriority}
                  options={PRIORITIES}
                  accent="berry"
                />
              </div>

              <div className="space-y-3">
                <FieldLabel required>营销预算</FieldLabel>
                <BudgetCards
                  value={marketingBudget}
                  onChange={setMarketingBudget}
                  customValue={customBudget}
                  onCustomChange={setCustomBudget}
                />
              </div>

              <div className="space-y-3">
                <FieldLabel htmlFor="avoidDirections">
                  想避免的方向（非目标）
                </FieldLabel>
                <p className="text-xs leading-relaxed text-ink-mute -mt-1">
                  告诉我们这部戏「不该」被宣传成什么样——这条会作为创作红线，我们会绕开。
                </p>
                <div className="flex flex-wrap gap-2">
                  {AVOID_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => appendAvoidChip(chip)}
                      className="rounded-full border border-stage-border bg-white px-3 py-1.5 text-left text-xs text-ink-soft transition hover:border-berry/30 hover:bg-pink-mist/50 hover:text-berry"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <Textarea
                  id="avoidDirections"
                  value={avoidDirections}
                  onChange={(e) => setAvoidDirections(e.target.value)}
                  placeholder='比如：这次想避开同质化的"上海女孩看话剧"叙事，想试试男性向角度。'
                  className="min-h-[100px] rounded-xl border-stage-border bg-white/80 text-base focus-visible:border-berry focus-visible:ring-berry/20"
                />
              </div>
            </FormSectionCard>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-stage-border bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <h3 className="text-sm font-medium text-berry">方案将包含</h3>
              <ul className="mt-4 space-y-2.5">
                {PLAN_ITEMS.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 rounded-xl bg-stage-bg px-3 py-2.5"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry-light" />
                    <div>
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-ink-mute">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-ink-mute">
                  <span>完成进度</span>
                  <span>{completedCount} / 4 个维度</span>
                </div>
                <Progress
                  value={progressValue}
                  className="h-2 bg-pink-mist [&_[data-slot=progress-indicator]]:bg-berry"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-berry/15 bg-gradient-to-br from-pink-mist to-white p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-berry">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-berry/10 text-xs">
                  i
                </span>
                填写提示
              </p>
              <p className="mt-2 text-sm font-normal leading-relaxed text-ink-soft">
                每个信息都影响直接质量方案。「内容维度」决定受众画像，「地理维度」决定投放渠道，「受众维度」决定文案语气，「商业目标」决定分配资源优先级。我们不会泄漏任何用户数据。
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer
        data-submit-bar
        className="sticky bottom-0 z-40 border-t border-stage-border bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <div className="flex gap-1.5">
              {sectionDone.map((done, i) => (
                <span
                  key={STEPS[i].id}
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    done ? "bg-accent-teal" : "bg-stage-border"
                  )}
                />
              ))}
            </div>
            <span>
              已填写 <strong className="text-berry">{completedCount}</strong> / 4 个维度
            </span>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <span className="text-xs text-ink-mute">预计 30 秒生成</span>
            <Button
              size="lg"
              onClick={handleSubmit}
              className="h-12 w-full rounded-full bg-berry px-8 text-base font-medium shadow-lg shadow-berry/25 hover:bg-berry-deep sm:w-auto"
            >
              <Wand2 className="text-accent-yellow" />
              生成营销方案
              <span className="ml-1">→</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
