import { tmpdir } from "node:os";
import { join } from "node:path";

export const createTempDirPath = (subpath) =>
	join(tmpdir(), `.reef/temp/${subpath}`);
