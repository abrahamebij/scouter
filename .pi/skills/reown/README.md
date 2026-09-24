# Reown Skills

A collection of [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills) for integrating Reown products. These skills provide AI-assisted guidance for wallet connections, blockchain interactions, and Web3 development.

## Available Skills

### [AppKit](skills/appkit/)

Guides developers through integrating [Reown AppKit](https://docs.reown.com/appkit/overview) into web applications. Covers wallet connection, network switching, and multi-chain support across all major frameworks and adapters.

**Frameworks:** React, Next.js, Vue, Nuxt, Svelte, vanilla JavaScript
**Chains:** EVM (Wagmi/Ethers), Solana, Bitcoin

## Project Structure

```
skills/
└── appkit/
    ├── AGENTS.md        # Skill agent instructions
    ├── CLAUDE.md        # Symlink to AGENTS.md
    ├── SKILL.md         # Comprehensive integration guide
    └── references/      # Per-framework + adapter reference docs
```

## Usage

Add this repository as a skill in your project to get context-aware help when building with Reown products.

## Resources

- [Reown Docs](https://docs.reown.com)
- [Reown Dashboard](https://dashboard.reown.com)
- [AppKit Web Examples](https://github.com/reown-com/appkit-web-examples)
