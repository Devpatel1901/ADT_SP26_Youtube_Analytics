import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import type { Video, VideoCreate } from '@/types/api'

const schema = z.object({
  video_id: z.string().min(1).max(20),
  trending_date: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  channel_title: z.string().min(1).max(255),
  channel_id: z.string().min(1).max(100),
  views: z.coerce.number().int().min(0),
  likes: z.coerce.number().int().min(0),
  dislikes: z.coerce.number().int().min(0),
  comments: z.coerce.number().int().min(0),
  publish_time: z.string().min(1, 'Required'),
  category_id: z.coerce.number().int(),
  tags: z.string().min(1, 'Use [none] if empty'),
  description: z.string().optional().nullable(),
}).refine(
  d => new Date(d.publish_time) <= new Date(`${d.trending_date}T23:59:59Z`),
  { message: 'publish_time must be on or before trending_date', path: ['publish_time'] },
)

type FormShape = z.infer<typeof schema>

interface Props {
  initial?: Video
  submitLabel: string
  onSubmit: (body: VideoCreate) => Promise<void>
  disableKeys?: boolean
}

export default function VideoForm({ initial, submitLabel, onSubmit, disableKeys }: Props) {
  const { data: categories = [] } = useCategories()
  const defaults: FormShape = {
    video_id: initial?.video_id ?? '',
    trending_date: initial?.trending_date ?? '',
    title: initial?.title ?? '',
    channel_title: initial?.channel_title ?? '',
    channel_id: initial?.channel_id ?? '',
    views: initial?.views ?? 0,
    likes: initial?.likes ?? 0,
    dislikes: initial?.dislikes ?? 0,
    comments: initial?.comments ?? 0,
    publish_time: initial?.publish_time?.slice(0, 16) ?? '',
    category_id: initial?.category_id ?? 10,
    tags: initial?.tags ?? '[none]',
    description: initial?.description ?? '',
  }
  const { register, handleSubmit, formState, setValue, watch } = useForm<FormShape>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaults,
  })

  const onValid = async (raw: FormShape) => {
    const pt = raw.publish_time.length === 16 ? `${raw.publish_time}:00Z` : raw.publish_time
    const body: VideoCreate = { ...raw, publish_time: pt, description: raw.description || null }
    await onSubmit(body)
  }

  const f = (k: keyof FormShape) => formState.errors[k]?.message as string | undefined

  return (
    <form onSubmit={handleSubmit(onValid)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="video_id" error={f('video_id')}>
        <Input {...register('video_id')} disabled={disableKeys} />
      </Field>
      <Field label="trending_date" error={f('trending_date')}>
        <Input type="date" {...register('trending_date')} disabled={disableKeys} />
      </Field>
      <Field label="title" error={f('title')} className="md:col-span-2">
        <Input {...register('title')} />
      </Field>
      <Field label="channel_title" error={f('channel_title')}>
        <Input {...register('channel_title')} />
      </Field>
      <Field label="channel_id" error={f('channel_id')}>
        <Input {...register('channel_id')} />
      </Field>
      <Field label="publish_time (UTC)" error={f('publish_time')}>
        <Input type="datetime-local" {...register('publish_time')} />
      </Field>
      <Field label="category" error={f('category_id')}>
        <Select
          value={String(watch('category_id'))}
          onValueChange={v => setValue('category_id', Number(v), { shouldValidate: true })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="views" error={f('views')}>
        <Input type="number" min={0} {...register('views')} />
      </Field>
      <Field label="likes" error={f('likes')}>
        <Input type="number" min={0} {...register('likes')} />
      </Field>
      <Field label="dislikes" error={f('dislikes')}>
        <Input type="number" min={0} {...register('dislikes')} />
      </Field>
      <Field label="comments" error={f('comments')}>
        <Input type="number" min={0} {...register('comments')} />
      </Field>
      <Field label="tags (pipe-separated)" error={f('tags')} className="md:col-span-2">
        <Input {...register('tags')} />
      </Field>
      <Field label="description" error={f('description')} className="md:col-span-2">
        <Textarea rows={4} {...register('description')} />
      </Field>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
