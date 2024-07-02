// uniform sampler2D posTex;
// uniform sampler2D picture;
uniform float opacity;
uniform float time;
uniform vec3 mainColor; 
  
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec2 vUv;

uniform samplerCube tCube;
// varying vec2 vUv;

void main() {
  // vec2 screen = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;
  
  // screen.y *= 16.0 / 9.0;
  // screen.y -= 16.0 / 9.0 * 0.75;
  // screen.x -= 0.5;
  
  // vec4 imgColor = texture2D(picture, (screen));

  // vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  
  // gl_FragColor = vec4(reflectedColor.xyz, 1.0);
  
  vec3 tRefract0 = vRefract[0];
  vec3 tRefract1 = vRefract[1];
  vec3 tRefract2 = vRefract[2];
  
  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  // vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4(1.0);

  refractedColor.r = textureCube( tCube, vec3( tRefract0.x, tRefract0.yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( tRefract1.x, tRefract1.yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( tRefract2.x, tRefract2.yz ) ).b;

  // refractedColor.r = textureCube( tCube, vec3( -tRefract0.x, tRefract0.yz ) ).r;
  // refractedColor.g = textureCube( tCube, vec3( -tRefract1.x, tRefract1.yz ) ).g;
  // refractedColor.b = textureCube( tCube, vec3( -tRefract2.x, tRefract2.yz ) ).b;

  // vec2 coord = gl_PointCoord.xy - vec2(0.5);
  // if (length(coord) > 0.5) {
  //   discard;
  // } else {
  //   gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
  // }
  gl_FragColor = mix( reflectedColor, refractedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
  gl_FragColor.rgb *= mainColor;

  // gl_FragColor.rgb = mainColor;
  gl_FragColor.a = opacity;
}

//

//

//