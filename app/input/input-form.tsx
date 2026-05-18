"use client";

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  MapPin,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FieldLabel } from "@/components/form/field-label";
import { FormSectionCard } from "@/components/form/form-section-card";
import { TagToggleGroup } from "@/components/form/tag-toggle-group";
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
const GENRE_TAGS = ["悬疑", "喜剧", "家庭", "历史", "女性", "科幻", "治愈"];
const MOODS = ["治愈", "烧脑", "爆笑", "沉重", "浪漫"];
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

const PLAN_ITEMS = [
  { title: "受众洞察报告", sub: "七问框架画像" },
  { title: "渠道策略方案", sub: "ABC 三层模型" },
  { title: "小红书内容包", sub: "5 篇可直接发布" },
  { title: "60 天执行日历", sub: "T-60 倒计时排期" },
  { title: "卖点话术清单", sub: "购票转化文案" },
];

const fieldClass =
  "h-11 rounded-xl border-stage-border bg-white/80 text-base shadow-none focus-visible:border-berry focus-visible:ring-berry/20";

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

export function InputForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const [playName, setPlayName] = useState("");
  const [playType, setPlayType] = useState("");
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [highlights, setHighlights] = useState("");

  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [showTime, setShowTime] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");

  const [audience, setAudience] = useState("");
  const [priceTier, setPriceTier] = useState("");
  const [decisionPath, setDecisionPath] = useState("");

  const [priority, setPriority] = useState("");

  const sectionDone = useMemo(
    () => [
      Boolean(playName && playType && genreTags.length && mood),
      Boolean(city && venue && showTime && ticketPrice),
      Boolean(audience && priceTier && decisionPath),
      Boolean(priority),
    ],
    [
      playName,
      playType,
      genreTags,
      mood,
      city,
      venue,
      showTime,
      ticketPrice,
      audience,
      priceTier,
      decisionPath,
      priority,
    ]
  );

  const completedCount = sectionDone.filter(Boolean).length;
  const progressValue = (completedCount / 4) * 100;

  const handleSubmit = () => {
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

  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader ctaHref="/result" />

      {/* 紫色 Hero + 步骤条 */}
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

      {/* 表单主体 */}
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

              <div className="space-y-2">
                <FieldLabel hint="可多选">题材标签</FieldLabel>
                <TagToggleGroup
                  options={GENRE_TAGS}
                  value={genreTags}
                  onChange={setGenreTags}
                  accent="yellow"
                />
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

              <div className="space-y-2 sm:max-w-xs">
                <FieldLabel htmlFor="ticketPrice" required>
                  票价（元）
                </FieldLabel>
                <Input
                  id="ticketPrice"
                  type="number"
                  min={0}
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="例：180"
                  className={fieldClass}
                />
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
              description="这次演出，你最想实现什么？只选一个。"
              accent="berry"
              icon={<Target className="h-5 w-5" />}
              isOpen={activeStep === 3}
              isComplete={sectionDone[3]}
              onOpen={() => goToStep(3)}
              onPrev={prevStep}
              showPrev
              isLast
              onNext={() => {
                document.querySelector("[data-submit-bar]")?.scrollIntoView({ behavior: "smooth" });
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
            </FormSectionCard>
          </div>

          {/* 右侧栏 */}
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
                  <span>
                    {completedCount} / 4 个维度
                  </span>
                </div>
                <Progress value={progressValue} className="h-2 bg-pink-mist [&_[data-slot=progress-indicator]]:bg-berry" />
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

      {/* 底部提交栏 */}
      <footer data-submit-bar className="sticky bottom-0 z-40 border-t border-stage-border bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8">
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
