import { NFTMetadataReturnType } from '../../constants/types'
import MoonCatIcon from '../../assets/png-icons/mooncat.png'
import MooncatProjectIcon from '../../assets/png-icons/mooncat-project-icon.png'

export const mockNFTMetadata: NFTMetadataReturnType[] = [
  {
    chainName: 'Ethereum',
    tokenType: 'ERC721',
    tokenID: '0x42a5',
    imageURL: MoonCatIcon,
    floorFiatPrice: '2123.42',
    floorCryptoPrice: '0.64922',
    contractInformation: {
      address: '0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69',
      name: 'MoonCatsRescue',
      description: 'After a whirlwind adventure four years in the making, 25440 MoonCats have been rescued and are acclimating to their life on the blockchain.',
      website: 'https://mooncat.community',
      twitter: 'https://twitter.com/ponderware',
      facebook: '',
      logo: MooncatProjectIcon
    }
  }
]
