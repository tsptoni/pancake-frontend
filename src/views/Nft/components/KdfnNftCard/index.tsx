import React, { useState, useContext, useEffect } from 'react'
import styled from 'styled-components'
import {
  Card,
  CardBody,
  Heading,
  Tag,
  Button,
  ChevronUpIcon,
  ChevronDownIcon,
  Text,
  CardFooter,
  useModal,
} from '@pancakeswap-libs/uikit'
import { getKdfnNFTsContract } from 'utils/contractHelpers'
import { useProfile } from 'state/hooks'
import useI18n from 'hooks/useI18n'
import { Nft } from 'config/constants/types'
import { useSquire, useKnight, useLegend, useTable } from 'hooks/useContract'
import useRefresh from 'hooks/useRefresh'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { useKdfnNftPurchaseApprove, useKdfnSquireApprove } from 'hooks/useApprove'
import UnlockButton from 'components/UnlockButton'
import ApproveSquireButton from 'components/ApproveSquireButton'
import ApproveKnightButton from 'components/ApproveKnightButton'
import ApproveLegendButton from 'components/ApproveLegendButton'
import ApproveTableButton from 'components/ApproveTableButton'
import InfoRow from '../InfoRow'
import Image from '../Image'
import { KdfnNftProviderContext } from '../../contexts/NftProvider'
import TransferNftModal from '../TransferNftModal'
import PurchaseNftModal from '../PurchaseNftModal'

type State = {
  mintCap: number
  numberMinted: number
  description: string
  purchaseTokenAmount: number
  purchaseTokenID: number
  adminCut: number
  mintable: boolean
}

interface NftCardProps {
  nft: Nft
}

const Header = styled(InfoRow)`
  min-height: 28px;
`

const DetailsButton = styled(Button).attrs({ variant: 'text', fullWidth: true })`
  height: auto;
  padding: 16px 24px;

  &:hover:not(:disabled):not(:active) {
    background-color: transparent;
  }

  &:focus:not(:active) {
    box-shadow: none;
  }
`

const InfoBlock = styled.div`
  padding: 24px;
`

const KdfnNftCard: React.FC<NftCardProps> = ({ nft }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const { fastRefresh } = useRefresh()
  const [state, setState] = useState<State>({
    mintCap: 0,
    numberMinted: 0,
    description: '',
    purchaseTokenAmount: 0,
    purchaseTokenID: -1,
    adminCut: 0,
    mintable: false
  })
  const TranslateString = useI18n()
  const { isInitialized, getTokenIds, getNftIds, reInitialize } = useContext(KdfnNftProviderContext)
  const { profile } = useProfile()
  const { tokenId, nftId, name, images } = nft
  const tokenIds = getTokenIds(tokenId)
  const nftIds = getNftIds(nftId)
  const walletOwnsNft = nftIds && nftIds.length > 0
  const Icon = isOpen ? ChevronUpIcon : ChevronDownIcon
  
  const squireContract = useSquire()
  const knightContract = useKnight()
  const legendContract = useLegend()
  const tableContract = useTable()
  const { account } = useWallet()
  const showTransferButton = 0

 
  

  const handleClick = async () => {
    setIsOpen(!isOpen)
  }

  const handleSuccess = () => {
    reInitialize()
  }

  useEffect(() => {
    const fetchNftData = async (id: number) => {
      const kdfnNFTsContract = getKdfnNFTsContract()
    
      const {mintCap, numberMinted, description, purchaseTokenAmount, purchaseTokenID, adminCut, mintable} = await kdfnNFTsContract.methods.nfts(id).call()
    
    setState((prevState) => ({
      ...prevState, 
      mintCap,
      numberMinted,
      description,
      purchaseTokenAmount,
      purchaseTokenID,
      adminCut,
      mintable
    }))
    }
    fetchNftData(nft.nftId) 
  }, [nft.nftId, fastRefresh])

  const [onPresentTransferModal] = useModal(
    <TransferNftModal nft={nft} tokenIds={tokenIds} onSuccess={handleSuccess} />,
  )

  const [onPresentPurchaseModal] = useModal(
    <PurchaseNftModal nft={nft} tokenIds={tokenIds} onSuccess={handleSuccess} />,
  )
  
  const purchaseToken = state.purchaseTokenID

  return (
    <Card isActive={walletOwnsNft}>
      <Image src={`/images/nfts/${images.lg}`} alt={name} originalLink={walletOwnsNft ? images.ipfs : null} />
      <CardBody>
        <Header>
          <Heading>{state.description}</Heading>
          {isInitialized && walletOwnsNft && (
            <Tag outline variant="secondary">
              {TranslateString(999, 'In Wallet')}
            </Tag>
          )}
        </Header>
        <Text>Price: {state.purchaseTokenAmount/1e18} {nft.purchaseTokenName} </Text>
        {state.mintable ? (<Text>Artist Earnings: {state.adminCut}%</Text>) : (<Text />)}
        <Text>Total Sold: {state.numberMinted}/{state.mintCap}</Text>
        {/* {isInitialized && walletOwnsNft (
          <Button  variant="secondary" mt="24px" onClick={onPresentTransferModal}>
            {TranslateString(999, 'Transfer')}
          </Button>
        )} */}
        
        {
          state.mintable ? (<Text/>) : (<Text>Sold Out!</Text>)
        }
        {account && state.mintable && nft.purchaseTokenName === "SQUIRE" ? (
            <ApproveSquireButton />      
          ) : (
            <Text/>
        )}
        {account && state.mintable && nft.purchaseTokenName === "KNIGHT" ? (
            <ApproveKnightButton />      
          ) : (
            <Text/>
        )}
        {account && state.mintable && nft.purchaseTokenName === "LEGEND" ? (
            <ApproveLegendButton />      
          ) : (
            <Text/>
        )}

        {account && state.mintable && nft.purchaseTokenName === "TABLE" ? (
            <ApproveTableButton />      
          ) : (
            <Text/>
        )}




        {account && state.mintable ? (
            <Button variant="secondary" mt="24px" onClick={onPresentPurchaseModal}>
              {TranslateString(999, 'Purchase')}
            </Button>            
          ) : (
            <Text />
          )}

          {!account && state.mintable ? (
            <UnlockButton />            
          ) : (
            <Text />
          )} 
      </CardBody>
      <CardFooter p="0">
        <DetailsButton endIcon={<Icon width="24px" color="primary" />} onClick={handleClick}>
          {TranslateString(658, 'Details')}
        </DetailsButton>
        {isOpen && (
          <InfoBlock>
            <Text as="p" color="textSubtle" style={{ textAlign: 'center' }}>
              {state.description}
            </Text>
          </InfoBlock>
        )}
      </CardFooter>
    </Card>
  )
}

export default KdfnNftCard