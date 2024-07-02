// uniform float pointSize;
// uniform sampler2D indexerTexture;
uniform float time;
uniform sampler2D posTex;


uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main () {
  // vec4 info = texture2D(indexerTexture, uv);
  
  vec4 pos = texture2D(posTex, uv);
  
  // vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
  // vec4 outputPos = projectionMatrix * mvPosition;
  
  
  vec4 mvPosition = modelViewMatrix * vec4( pos.xyz, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( pos.xyz, 1.0 );
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vec3 I = worldPosition.xyz - cameraPosition;
  vReflect = reflect( I, worldNormal );
  
  vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );

  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}
