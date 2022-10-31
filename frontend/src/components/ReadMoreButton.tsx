import { Button, Stack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ReadMoreButtonProps } from '../types/type';

export const ReadmoreButton = ({ postId }: ReadMoreButtonProps) => {
  return (
    <Link to={postId.toString()}>
      <Stack direction={'row'} justify="end" spacing={6}>
        <div>
          <Button
            flex={1}
            rounded="md"
            bg={'blue.400'}
            color={'white'}
            boxShadow={'0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'}
            _hover={{
              bg: 'blue.500',
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            _focus={{
              bg: 'blue.500'
            }}>
            Read More
          </Button>
        </div>
      </Stack>
    </Link>
  );
};
