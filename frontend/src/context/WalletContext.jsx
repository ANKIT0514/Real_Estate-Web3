import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext(null)

export const WalletProvider = ({ children }) => {
  const [account,    setAccount]    = useState(null)
  const [provider,   setProvider]   = useState(null)
  const [signer,     setSigner]     = useState(null)
  const [balance,    setBalance]    = useState('0')
  const [connecting, setConnecting] = useState(false)
  const [error,      setError]      = useState(null)

  const fetchBalance = useCallback(async (_provider, _account) => {
    try {
      const bal = await _provider.getBalance(_account)
      setBalance(ethers.formatEther(bal))
    } catch (e) {
      console.log('Balance fetch error:', e)
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found!')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      // Force MetaMask to use Hardhat network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      }).catch(async (switchError) => {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Hardhat Local',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            }],
          })
        }
      })

      const _provider = new ethers.BrowserProvider(window.ethereum)
      await _provider.send('eth_requestAccounts', [])
      const _signer  = await _provider.getSigner()
      const _account = await _signer.getAddress()

      setProvider(_provider)
      setSigner(_signer)
      setAccount(_account)

      // Fetch balance immediately
      await fetchBalance(_provider, _account)

      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
          await fetchBalance(_provider, accounts[0])
        }
      })
      window.ethereum.on('chainChanged', () => window.location.reload())

    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setConnecting(false)
    }
  }, [fetchBalance])

  // Auto refresh balance every 5 seconds
  useEffect(() => {
    if (!provider || !account) return
    const interval = setInterval(() => {
      fetchBalance(provider, account)
    }, 5000)
    return () => clearInterval(interval)
  }, [provider, account, fetchBalance])

  const disconnect = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setBalance('0')
  }, [])

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null

  return (
    <WalletContext.Provider value={{
      account, provider, signer, balance,
      connecting, error, shortAddress,
      connect, disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)