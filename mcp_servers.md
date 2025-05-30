### MCP Servers
#### Context 7
##### Remote
```
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```
##### Local
```
{
  "servers": {
    "Context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### Code from Context 7 MCP Servers
Make sure you search the MCP servers when using the following code to build the app

- wagmi: https://github.com/wevm/wagmi
- vercel: https://github.com/vercel/sdk
- solidity: https://github.com/ethereum/solidity
- PDP Payments: https://github.com/timfong888/pdp-payment
