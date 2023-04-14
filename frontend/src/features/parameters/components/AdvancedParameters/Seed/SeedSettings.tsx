import { Flex } from '@chakra-ui/react';
import Perlin from './Perlin';
import RandomizeSeed from './RandomizeSeed';
import Seed from './Seed';
import ShuffleSeed from './ShuffleSeed';
import Threshold from './Threshold';

/**
 * Seed & variation options. Includes iteration, seed, seed randomization, variation options.
 */
const SeedSettings = () => {
  return (
    <Flex gap={2} direction={'column'}>
      <RandomizeSeed />
      <Flex gap={2}>
        <Seed />
        <ShuffleSeed />
      </Flex>
    </Flex>
  );
};

export default SeedSettings;
