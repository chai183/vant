/**
 * @vitest-environment node
 */
import Demo from '../demo/index.vue';
import { snapshotDemo } from '../../../test/demo.js';

snapshotDemo(Demo, { ssr: true });
