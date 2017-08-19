import {
  killAllProcesses,
  waitForAnyProcessOutputToMatch,
  execAndWaitForOutputToMatch,
} from '../../utils/process';
import { expectToFail } from '../../utils/utils';
import { readFile, writeFile } from '../../utils/fs';


// Karma is only really finished with a run when it shows a non-zero total time in the first slot.
const karmaGoodRegEx = /Executed 3 of 3 SUCCESS \(\d+\.\d+ secs/;

export default function () {
  let originalSpec: string;
  return execAndWaitForOutputToMatch('ng', ['test'], karmaGoodRegEx)
    .then(() => readFile('apps/myapp/src/app/app.component.spec.ts'))
    .then((data) => originalSpec = data)
    // Trigger a failed rebuild, which shouldn't run tests again.
    .then(() => writeFile('apps/myapp/src/app/app.component.spec.ts', '<p> definitely not typescript </p>'))
    .then(() => expectToFail(() => waitForAnyProcessOutputToMatch(karmaGoodRegEx, 10000)))
    // Restore working spec.
    .then(() => writeFile('apps/myapp/src/app/app.component.spec.ts', originalSpec))
    .then(() => waitForAnyProcessOutputToMatch(karmaGoodRegEx, 20000))
    .then(() => killAllProcesses(), (err: any) => {
      killAllProcesses();
      throw err;
    });
}
