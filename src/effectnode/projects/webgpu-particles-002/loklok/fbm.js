// Three.js Transpiler r165

import {
	float,
	PI,
	cos,
	sin,
	mat3,
	vec3,
	tslFn,
	mul,
	add,
	abs,
	pow,
	sub,
} from "three/nodes";

// const PI = float(3.14159265);
const SCALE = float(1.0);
const m = mat3(
	cos(PI.mul(SCALE)),
	sin(PI.mul(SCALE)).negate(),
	0.0,
	sin(PI.mul(SCALE)),
	cos(PI.mul(SCALE)),
	0.0,
	0.0,
	0.0,
	1.0
);

const noise = tslFn(([p_immutable]) => {
	const p = vec3(p_immutable).toVar();

	return cos(p.x).mul(sin(p.y).mul(cos(p.z)));
});

const fbm4 = tslFn(([p_immutable]) => {
	const p = vec3(p_immutable).toVar();
	const f = float(0.0).toVar();
	f.addAssign(mul(0.5, noise(p)));
	p.assign(m.mul(p.mul(2.02)));
	f.addAssign(mul(0.25, noise(p)));
	p.assign(m.mul(p.mul(2.03)));
	f.addAssign(mul(0.125, noise(p)));
	p.assign(m.mul(p.mul(2.01)));
	f.addAssign(mul(0.0625, noise(p)));

	return f.div(0.9375);
});

const fbm6 = tslFn(([p_immutable]) => {
	const p = vec3(p_immutable).toVar();
	const f = float(0.0).toVar();
	f.addAssign(mul(0.5, add(0.5, mul(0.5, noise(p)))));
	p.assign(m.mul(p.mul(2.02)));
	f.addAssign(mul(0.25, add(0.5, mul(0.5, noise(p)))));
	p.assign(m.mul(p.mul(2.03)));
	f.addAssign(mul(0.125, add(0.5, mul(0.5, noise(p)))));
	p.assign(m.mul(p.mul(2.01)));
	f.addAssign(mul(0.0625, add(0.5, mul(0.5, noise(p)))));
	p.assign(m.mul(p.mul(2.04)));
	f.addAssign(mul(0.03125, add(0.5, mul(0.5, noise(p)))));
	p.assign(m.mul(p.mul(2.01)));
	f.addAssign(mul(0.015625, add(0.5, mul(0.5, noise(p)))));

	return f.div(0.96875);
});

const pattern = tslFn(([p_immutable, time_immutable]) => {
	const time = float(time_immutable).toVar();
	const p = vec3(p_immutable).toVar();
	const vout = float(
		fbm4(p.add(time.add(fbm6(p.add(fbm4(p.add(time)))))))
	).toVar();

	return abs(vout);
});

// layouts

noise.setLayout({
	name: "noise",
	type: "float",
	inputs: [{ name: "p", type: "vec3", qualifier: "in" }],
});

fbm4.setLayout({
	name: "fbm4",
	type: "float",
	inputs: [{ name: "p", type: "vec3" }],
});

fbm6.setLayout({
	name: "fbm6",
	type: "float",
	inputs: [{ name: "p", type: "vec3" }],
});

pattern.setLayout({
	name: "pattern",
	type: "float",
	inputs: [
		{ name: "p", type: "vec3" },
		{ name: "time", type: "float" },
	],
});

export { noise, fbm4, fbm6, pattern };
