import * as esbuild from 'esbuild';

const production = process.argv[process.argv.length - 1] === "production";

const on_build: esbuild.Plugin = {
    name: "on-build",
    setup(build) {
        build.onEnd(result => {
            console.log("built!");
        });
    }
};

async function main() {
    const ctx = await esbuild.context({
        sourcemap: production ? undefined : "inline",
        entryPoints: ['src/ui/main.tsx', 'src/ui/main.css'],
        bundle: true,
        outdir: 'build',
        minify: production,
        plugins: [on_build],
        external: ["electron", "node:path", "node:url"],
        treeShaking: true
    });

    if (production) {
        await ctx.rebuild();
        await ctx.dispose();
    } else
        await ctx.watch();
}

main().catch(err =>
    console.log(err)
);