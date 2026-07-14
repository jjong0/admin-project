# React + TypeScript + Vite

이 템플릿은 HMR과 ESLint 규칙이 적용된 최소한의 Vite + React 개발 환경을 제공합니다.

현재 두 가지 공식 플러그인을 사용할 수 있습니다.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) — [Oxc](https://oxc.rs) 사용
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) — [SWC](https://swc.rs/) 사용

## React Compiler

이 템플릿에는 개발/빌드 성능에 미치는 영향 때문에 React Compiler가 기본으로 활성화되어 있지 않습니다. 추가하려면 [해당 문서](https://react.dev/learn/react-compiler/installation)를 참고하세요.

## ESLint 설정 확장하기

프로덕션 애플리케이션을 개발 중이라면, `tseslint.configs.recommendedTypeChecked` 또는 `strictTypeChecked`를 사용하여 타입 인식(type-aware) 린트 규칙을 활성화하는 것을 권장합니다. 자세한 내용은 [`eslint.config.js`](./eslint.config.js)와 [typescript-eslint 문서](https://typescript-eslint.io/getting-started/typed-linting)를 참고하세요.
