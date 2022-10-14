import {ChildProcessWithoutNullStreams, spawn, SpawnOptionsWithoutStdio} from "child_process";
import treeKill from "tree-kill";
import {createInterface} from "readline";

const _sysShutdownCbs: CallableFunction[] = [];

const applyShutdownHooks = () => {
    let called = false;
    const callback = (code: any) => {
        if (!called) {
            console.log("Shutting down system!");
            _sysShutdownCbs.forEach(cb => cb());
            process.exit(!!code && typeof code === "number" ? +code : 0);
        }
        called = true;
    }

    if (process.platform === "win32") {
        const rl = createInterface({input: process.stdin, output: process.stdout});
        rl.on("SIGINT", callback);
    }
    process.on('SIGINT', callback);
    process.on('SIGUSR1', callback);
    process.on('SIGUSR2', callback);
    process.on('uncaughtException', (err) => {
        console.error(err);
        callback(-1);
    });
    process.on('unhandledRejection', callback);
    process.on('exit', callback);
}

applyShutdownHooks();

/**
 * Class for spawning new executables and process related operations
 */
export class ExecUtil {
    /**
     * Spawn a new process using a command and arguments
     *
     * @param cmd The command to run
     * @param args the args to go with the command
     * @param options The options for the spawn
     */
    public spawn(cmd: string, args: string[], options: SpawnOptionsWithoutStdio): Process {
        return new Process(spawn(cmd, args, Object.assign({shell: true}, options)))
    }

    /**
     * Utility function for handling the Ctrl+C or pkill etc. all the ways a process can be exited
     * so the shutdown can be handled correctly
     *
     * @param cb called when the system is shut down
     */
    public onSystemExit(cb: () => void) {
        _sysShutdownCbs.push(cb);
    }
}


/**
 * A stream listener a function that will provide a line by line input from the process running
 */
type StreamListener = (data: string) => void;

/**
 * The process wrapper class for handing a process spawned by the ExecUtil class
 */
export class Process {
    private listenersStdOut: StreamListener[] = [];
    private listenersStdErr: StreamListener[] = [];

    constructor(private proc: ChildProcessWithoutNullStreams) {
        const handleChunk = (chunk, arr: StreamListener[]) => {
            const messages = chunk.toString().split('\n');
            messages.forEach(msg => {
                arr.forEach(lis => {
                    lis(msg);
                })
            });
        };
        proc.stdout.on('data', c => handleChunk(c, this.listenersStdOut));
        proc.stderr.on('data', c => handleChunk(c, this.listenersStdErr));
    }

    /**
     * @returns The process id of the process
     */
    public get pid() {
        return this.proc.pid || -1;
    }

    /**
     * Handle stdout messages from the process
     *
     * @param cb the {@link StreamListener}
     */
    public onOutput(cb: StreamListener) {
        if (this.listenersStdOut.indexOf(cb) === -1) {
            this.listenersStdOut.push(cb);
        }
    }

    /**
     * Handle stderr messages from the process
     *
     * @param cb the {@link StreamListener}
     */
    public onError(cb: StreamListener) {
        if (this.listenersStdErr.indexOf(cb) === -1) {
            this.listenersStdErr.push(cb);
        }
    }

    /**
     * Map stdout and stderr to console.log and console.error
     */
    public addConsoleOutputs() {
        this.onOutput(console.log);
        this.onError(console.error);
    }

    /**
     * Gets called when the underlying process exits
     *
     * @param cb The callback
     */
    public onExit(cb: (code: number) => void) {
        this.proc.on('exit', cb);
    }

    /**
     * Kill the process running it will run the signal "SIGTERM" be sure to handle this in the process running
     */
    public killProcess() {
        treeKill(this.pid, 'SIGTERM', err => {
            if (err) {
                console.error("Something went wrong");
                console.error(err);
            } else {
                console.log("Killed process: " + this.pid);
            }
        });
    }
}