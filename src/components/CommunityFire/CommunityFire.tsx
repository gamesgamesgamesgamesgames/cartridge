'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, List } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────

type EmberType = 'like' | 'list' | 'listItem'

type Ember = {
	id: number
	type: EmberType
	x: number
	wobbleDuration: number
	wobbleDelay: number
	createdAt: number
}

// ─── Shader sources ────────────────────────────────────

const VERT = `attribute vec2 a_position;
void main(){gl_Position=vec4(a_position,0,1);}`

const FRAG = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+10.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time;

  vec3 amber=vec3(1.,.78,.325);
  vec3 coral=vec3(1.,.459,.373);
  vec3 pink=vec3(1.,.235,.686);

  // Color zones — low frequency for large smooth blocks, vertical drift
  float cn1=snoise(vec2(uv.x*.6,uv.y*.4+t*.02));
  float cn2=snoise(vec2(uv.x*.8+t*.01,uv.y*.3+t*.025));
  vec3 col=mix(amber,coral,smoothstep(-.3,.3,cn1));
  col=mix(col,pink,smoothstep(-.2,.5,cn2)*.5);

  // Caustic brightness — broad intersecting waves, upward flow
  float w1=snoise(vec2(uv.x*1.5+t*.02,uv.y*2.+t*.06));
  float w2=snoise(vec2(uv.x*1.2-t*.015,uv.y*2.5+t*.05));
  float caustic=smoothstep(-.1,.5,w1*w2+.25);
  float w3=snoise(vec2(uv.x*2.5+t*.03,uv.y*3.+t*.07));
  float w4=snoise(vec2(uv.x*2.-t*.025,uv.y*3.5+t*.06));
  float fine=smoothstep(0.,.4,w3*w4+.15);
  col*=.55+.3*caustic+.15*fine;

  // Uneven top edge — smooth, slow-breathing boundary
  float en1=snoise(vec2(uv.x*1.5+t*.02,t*.03));
  float en2=snoise(vec2(uv.x*3.-t*.03,t*.02));
  float edge=.6+en1*.2+en2*.1;
  float a=smoothstep(edge,edge*.05,uv.y);
  a*=.7+.3*(1.-uv.y);

  // Bright seam at the very bottom
  float edgeGlow=smoothstep(.04,0.,uv.y)*.35;
  a+=edgeGlow;

  a*=.6;
  a=clamp(a,0.,1.);

  gl_FragColor=vec4(col,a);
}`

// ─── WebGL helpers ─────────────────────────────────────

function initGL(canvas: HTMLCanvasElement) {
	const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
	if (!gl) return null

	function compile(type: number, src: string) {
		const s = gl!.createShader(type)!
		gl!.shaderSource(s, src)
		gl!.compileShader(s)
		return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null
	}

	const vs = compile(gl.VERTEX_SHADER, VERT)
	const fs = compile(gl.FRAGMENT_SHADER, FRAG)
	if (!vs || !fs) return null

	const prog = gl.createProgram()!
	gl.attachShader(prog, vs)
	gl.attachShader(prog, fs)
	gl.linkProgram(prog)
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
	gl.useProgram(prog)

	const buf = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buf)
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
		gl.STATIC_DRAW,
	)
	const a = gl.getAttribLocation(prog, 'a_position')
	gl.enableVertexAttribArray(a)
	gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

	return {
		gl,
		uTime: gl.getUniformLocation(prog, 'u_time'),
		uRes: gl.getUniformLocation(prog, 'u_resolution'),
	}
}

// ─── Jetstream config ──────────────────────────────────

const JETSTREAM_URL = 'wss://jetstream1.us-east.bsky.network/subscribe'
const COLLECTIONS = [
	'games.gamesgamesgamesgames.graph.like',
	'games.gamesgamesgamesgames.feed.list',
	'games.gamesgamesgamesgames.feed.listItem',
]

const EMBER_LABELS: Record<EmberType, string> = {
	like: 'liked a game',
	list: 'created a list',
	listItem: 'added to a list',
}

function toEmberType(collection: string): EmberType | null {
	if (collection.endsWith('.like')) return 'like'
	if (collection.endsWith('.listItem')) return 'listItem'
	if (collection.endsWith('.list')) return 'list'
	return null
}

// ─── Component ─────────────────────────────────────────

const MAX_EMBERS = 8
const THROTTLE_MS = 1500
const LIFETIME_MS = 6000

export function CommunityFire() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const ctxRef = useRef<ReturnType<typeof initGL>>(null)
	const rafRef = useRef(0)
	const t0Ref = useRef(0)
	const reducedRef = useRef(false)
	const lastEmberRef = useRef(0)
	const nextIdRef = useRef(0)
	const [embers, setEmbers] = useState<Ember[]>([])
	const [noWebGL, setNoWebGL] = useState(false)

	useEffect(() => {
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
		reducedRef.current = mql.matches
		const handler = (e: MediaQueryListEvent) => {
			reducedRef.current = e.matches
		}
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const dpr = Math.min(devicePixelRatio, 2)
		const resize = () => {
			const { width, height } = canvas.getBoundingClientRect()
			canvas.width = width * dpr
			canvas.height = height * dpr
			ctxRef.current?.gl.viewport(0, 0, canvas.width, canvas.height)
		}

		ctxRef.current = initGL(canvas)
		if (!ctxRef.current) {
			setNoWebGL(true)
			return
		}

		resize()
		addEventListener('resize', resize)
		t0Ref.current = performance.now() / 1000

		const tick = () => {
			const c = ctxRef.current
			if (!c) return
			const t = performance.now() / 1000 - t0Ref.current
			c.gl.uniform1f(c.uTime, reducedRef.current ? 0 : t)
			c.gl.uniform2f(c.uRes, canvas.width, canvas.height)
			c.gl.drawArrays(c.gl.TRIANGLES, 0, 6)
			if (!reducedRef.current) rafRef.current = requestAnimationFrame(tick)
		}
		tick()

		return () => {
			cancelAnimationFrame(rafRef.current)
			removeEventListener('resize', resize)
		}
	}, [])

	useEffect(() => {
		const id = setInterval(() => {
			setEmbers((prev) => prev.filter((e) => Date.now() - e.createdAt < LIFETIME_MS))
		}, 1000)
		return () => clearInterval(id)
	}, [])

	useEffect(() => {
		const params = new URLSearchParams()
		COLLECTIONS.forEach((c) => params.append('wantedCollections', c))
		const ws = new WebSocket(`${JETSTREAM_URL}?${params}`)

		ws.onmessage = (e) => {
			if (reducedRef.current) return
			const now = Date.now()
			if (now - lastEmberRef.current < THROTTLE_MS) return

			try {
				const d = JSON.parse(e.data)
				if (d.kind !== 'commit' || d.commit?.operation !== 'create') return
				const type = toEmberType(d.commit.collection)
				if (!type) return

				lastEmberRef.current = now
				setEmbers((prev) =>
					[
						...prev,
						{
							id: ++nextIdRef.current,
							type,
							x: 10 + Math.random() * 80,
							wobbleDuration: 1800 + Math.random() * 800,
							wobbleDelay: Math.random() * -2000,
							createdAt: now,
						},
					].slice(-MAX_EMBERS),
				)
			} catch {
				/* ignore malformed messages */
			}
		}

		return () => ws.close()
	}, [])

	return (
		<div
			aria-hidden={'true'}
			className={'pointer-events-none absolute inset-x-0 bottom-0 h-[40rem] select-none overflow-hidden'}>
			<style
				dangerouslySetInnerHTML={{
					__html: `
@keyframes ember-rise {
  0%   { opacity: 0; transform: translateX(-50%) translateY(0); }
  8%   { opacity: 1; }
  75%  { opacity: 0.6; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-420px); }
}
@keyframes ember-wobble {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(22px); }
  75%      { transform: translateX(-22px); }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes ember-rise { from, to { opacity: 0; } }
  @keyframes ember-wobble { from, to { transform: none; } }
}`,
				}}
			/>

			{noWebGL ? (
				<div className={'absolute inset-0 bg-gradient-to-t from-primary/20 via-liked/10 to-transparent'} />
			) : (
				<canvas ref={canvasRef} className={'absolute inset-0 size-full'} />
			)}

			{embers.map((ember) => {
				const Icon = ember.type === 'like' ? Heart : List
				return (
					<div
						key={ember.id}
						className={'absolute bottom-10'}
						style={{
							left: `${ember.x}%`,
							animation: `ember-rise ${LIFETIME_MS}ms ease-out forwards`,
							willChange: 'transform, opacity',
						}}>
						<div
							style={{
								animation: `ember-wobble ${ember.wobbleDuration}ms ease-in-out ${ember.wobbleDelay}ms infinite`,
								willChange: 'transform',
							}}
							className={
								'flex items-center gap-1 whitespace-nowrap rounded-full bg-background/50 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm'
							}>
							<Icon
								className={`size-3 ${ember.type === 'like' ? 'fill-current text-liked' : 'text-primary'}`}
							/>
							{EMBER_LABELS[ember.type]}
						</div>
					</div>
				)
			})}
		</div>
	)
}
