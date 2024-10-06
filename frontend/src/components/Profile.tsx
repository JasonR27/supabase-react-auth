// import { EditIcon } from '@chakra-ui/icons';
// import {
//   Box, Progress, useToast,
//   Heading,
//   Text,
//   Stack,
//   Button,
//   Badge,
//   useColorModeValue,
//   Flex,
//   Input,
//   FormControl,
//   FormLabel,
//   Tag,
//   TagLabel,
//   useDisclosure,
//   AlertDialog,
//   AlertDialogOverlay,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogBody,
//   AlertDialogFooter,
//   HStack
// } from '@chakra-ui/react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { Session, User } from '@supabase/supabase-js';
import { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { supabaseClient } from '../config/supabase-client';
import { getRandomColor } from '../utils/functions';
import PersonalAvatar from './PersonalAvatar';
// import { AsyncSelect, MultiValue } from 'chakra-react-select';
import { pickListOptions } from '../config/pickListOptions';
import { FaAddressBook, FaCheck } from 'react-icons/fa';
import eventBus from '../eventBus';
import { createPicture, getPictureByProfileId, getProfileByAuthorEmail, updatePicture, createProfile, saveProfile, publishProfile } from '../api';

const mappedColourOptions = pickListOptions.map(option => ({
  ...option,
  colorScheme: option.color
}));

const Profile = () => {
  const [session, setSession] = useState<Session | null>();
  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<IProfile>()
  const [picture, setPicture] = useState<IPicture>()
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [website, setWebsite] = useState<string>();
  const [company, setCompany] = useState<string>();
  const [profileId, setProfileId] = useState<number>()
  const [authorEmail, setAuthorEmail] = useState<string>();

  const [isEditingLanguage, setIsEditingLanguage] = useState<boolean>();
  const [isUrlUploaded, setIsUrlUploaded] = useState<boolean>();
  const [isPublic, setIsPublic] = useState<boolean>();
  const [languages, setLanguages] = useState<IProgrammingLanguage[] | undefined>();
  const [newParams, setNewParams] = useState<any[]>([]);
  // const toast = useToast();
  // const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null);

  // const color3 = useColorModeValue('gray.50', 'gray.800')
  // const color4 = useColorModeValue('white', 'gray.700')

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      setSession(session);
      //console.log('session from App', session?.access_token)
      if (session) {
        setUser(session.user)
      }
    };

    setData();
  }, []);

  const fetchProfilePicture = async () => {
    const res: AxiosResponse<ApiDataType> = await getPictureByProfileId(profile?.id!)
    return res.data
  }

  const { data: pictureData, isLoading, isError, refetch: refetchPicture } = useQuery(['profilePicture'], fetchProfilePicture, {
    enabled: false, retry: 2, cacheTime: 0, onSuccess(res: IPicture) {
      setPicture(res)
    },
    onError: (error: any) => {
      // toast({
      //   title: 'Error',
      //   position: 'top',
      //   variant: 'subtle',
      //   description: error,
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true
      // });
    }
  })

  const fetchProfile = async () => {
    const res: AxiosResponse<ApiDataType> = await getProfileByAuthorEmail(user?.email!)
    return res.data;
  };

  const { data: profileData, error: profileError, isLoading: isFetchingProfile, refetch: refetchProfile } = useQuery(['profile'], fetchProfile, {
    enabled: false, retry: 2, cacheTime: 0, onSuccess(res: IProfile) {
      setProfile(res)
      if (res != null) {
        setUsername(res.username)
        setWebsite(res.website)
        setCompany(res.company)
        setProfileId(res.id)
        setIsPublic(res.isPublic)
        setAuthorEmail(res.authorEmail)
        if (res.programmingLanguages.length !== newParams.length) {
          res.programmingLanguages.forEach(obj => {
            newParams.push(obj.language)
          })
        }
        setLanguages(newParams)
        setIsEditingLanguage(false)
      } else {
        setIsEditingLanguage(true)
      }
    },
    onError: (error: any) => {
      // toast({
      //   title: 'Error',
      //   position: 'top',
      //   variant: 'subtle',
      //   description: error,
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true
      // });
    }
  });

  const postCreateProfile = async (): Promise<AxiosResponse> => {
    // const profile: Omit<IProfile, 'id'> = {
    const profile: Omit<IProfile, 'id'> = {
      // userId:
      userId: user?.id!,
      website: website!,
      username: username!,
      company: company!,
      authorEmail: user?.email!,
      programmingLanguages: languages!
    };
    return await createProfile(profile);
  }

  const { isLoading: isCreatingProfile, mutate: postProfile } = useMutation(postCreateProfile, {
    onSuccess(res) {
      // toast({
      //   title: 'Profile created.',
      //   position: 'top',
      //   variant: 'subtle',
      //   description: '',
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true
      // });
      refetchProfile()
    }
  });

  const postUpdateProfile = async (): Promise<AxiosResponse> => {
    const profile: IProfile = {
      website: website!,
      username: username!,
      company: company!,
      authorEmail: user?.email!,
      id: profileId!,
      userId: user?.id!,
      programmingLanguages: languages!
    };
    return await saveProfile(profile);
  }

  const { isLoading: isUpdatingProfile, mutate: updateProfile } = useMutation(
    postUpdateProfile,
    {
      onSuccess: (res) => {
        // toast({
        //   title: 'Profile updated.',
        //   position: 'top',
        //   variant: 'subtle',
        //   description: '',
        //   status: 'success',
        //   duration: 3000,
        //   isClosable: true
        // });
        refetchProfile()
      },
      onError: (err) => {
        console.log(err)
      },
      //onMutate: () => console.log('mutating')
    }
  );

  const postPublishProfile = async (): Promise<AxiosResponse> => {
    return await publishProfile(profileId!);
  }

  const { isLoading: isPublishingProfile, mutate: publish } = useMutation(
    postPublishProfile,
    {
      onSuccess: (res) => {
        // toast({
        //   title: 'Profile published.',
        //   position: 'top',
        //   variant: 'subtle',
        //   description: '',
        //   status: 'success',
        //   duration: 3000,
        //   isClosable: true
        // });
        refetchProfile()
      },
      onError: (err) => {
        console.log(err)
      },
      //onMutate: () => console.log('mutating')
    }
  );

  const postCreateProfilePicture = async (): Promise<AxiosResponse> => {
    const picture: Omit<IPicture, 'id'> = {
      profileId: profileId!,
      avatarUrl: avatarUrl!
    };
    return await createPicture(picture, session?.access_token!);
  }

  const { isLoading: isCreatingProfileUrl, mutate: createProfilePicture } = useMutation(
    postCreateProfilePicture,
    {
      onSuccess: (res) => {
        // toast({
        //   title: 'Picture created.',
        //   position: 'top',
        //   variant: 'subtle',
        //   description: '',
        //   status: 'success',
        //   duration: 3000,
        //   isClosable: true
        // });
        eventBus.dispatch('profileUpdated', true);
      },
      onError: (err: any) => {
        // toast({
        //   title: 'Error uploading picture',
        //   position: 'top',
        //   variant: 'subtle',
        //   description: err.response.data.error,
        //   status: 'error',
        //   duration: 3000,
        //   isClosable: true
        // });
      },
    }
  );

  const postUpdateProfilePicture = async (): Promise<AxiosResponse> => {
    const picture: Omit<IPicture, 'id'> = {
      profileId: profileId!,
      avatarUrl: avatarUrl!
    };
    return await updatePicture(picture, session?.access_token!);
  }

  const { isLoading: isUpdatingProfileUrl, mutate: updateProfilePicture } = useMutation(
    postUpdateProfilePicture,
    {
      onSuccess: (res) => {
        // toast({
        //   title: 'Picture updated.',
        //   position: 'top',
        //   variant: 'subtle',
        //   description: '',
        //   status: 'success',
        //   duration: 3000,
        //   isClosable: true
        // });
        eventBus.dispatch('profileUpdated', true);
      },
      onError: (err) => {
        console.log(err)
      },
    }
  );

  useEffect(() => {
    if (user) {
      //console.log('user->', user)
      refetchProfile()
    }
    if (profile) {
      //console.log('prof', profile)
      refetchPicture()
    }
    if (picture) {
      //console.log('pic pic', picture)
    }

  }, [user, refetchProfile, profile, refetchPicture])

  useEffect(() => {

    if (isUrlUploaded) {
      handleProfilePicture()
    }
  }, [isUrlUploaded])

  async function handleProfilePicture() {
    try {
      picture?.id ? updateProfilePicture() : createProfilePicture();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function publishMe() {
    // onClose()
    publish();
  }

  function postData() {
    try {
      if (profileId) {
        updateProfile()
      } else {
        postProfile()
      }
    } catch (err) {
      //setPostResult(fortmatResponse(err));
    }
  }

  const editLanguage = () => {
    setNewParams([])
    setIsEditingLanguage(true)
  }

  // function handleLanguages(e: MultiValue<{ colorScheme: string; value: string; label: string; color: string; }>) {
  //   let newParams: any[] = []
  //   for (let i = 0; i < e.length; i += 1) {
  //     const obje = e[i].value
  //     newParams.push(obje)
  //   }

  //   setLanguages(newParams)
  // }

  // if (isFetchingProfile) return <Progress size={'xs'} isIndeterminate />

  return (
    <>
    <div className="container mt-5">
  <div className="row justify-content-center">
    <div className="col-md-8">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center">User Profile Edit</h2>
          <form>
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input type="text" className="form-control" id="userName" placeholder="username" value="" />
            </div>
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input type="text" className="form-control" id="website" placeholder="website" value="" />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input type="text" className="form-control" id="company" placeholder="company" value="" />
            </div>
            <div className="form-group">
              <label htmlFor="languages">Programming languages</label>
              <select multiple className="form-control" id="languages">
                <option>Java</option>
                <option>GoLang</option>
                {/* <!-- Add more options as needed --> */}
              </select>
            </div>
            <button type="button" className="btn btn-primary w-100 mt-3" data-toggle="modal" data-target="#publishModal">
              Publish Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

{/* <!-- Alert Dialog --> */}
{/* <div className="modal fade" id="publishModal" tabindex="-1" role="dialog" aria-labelledby="publishModalLabel" aria-hidden="true"> */}
<div className="modal fade" id="publishModal" role="dialog" aria-labelledby="publishModalLabel" aria-hidden="true">
  <div className="modal-dialog" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="publishModalLabel">Publish Profile</h5>
        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="modal-body">
        Are you sure? You can't undo this action afterwards.
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
        <button type="button" className="btn btn-primary">Publish</button>
      </div>
    </div>
  </div>
</div>

    </>
  );
}

export default Profile