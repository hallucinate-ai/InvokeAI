import { createSelector } from '@reduxjs/toolkit';

import IAIButton from 'common/components/IAIButton';
import IAIInput from 'common/components/IAIInput';
import IAINumberInput from 'common/components/IAINumberInput';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { systemSelector } from 'features/system/store/systemSelectors';

import {
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { addNewModel } from 'app/socketio/actions';
import { Field, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import type { InvokeModelConfigProps } from 'app/invokeai';
import type { RootState } from 'app/store';
import type { FieldInputProps, FormikProps } from 'formik';
import { isEqual, pickBy } from 'lodash';
import { setHeight } from 'features/parameters/store/generationSlice';

const selector = createSelector(
  [systemSelector],
  (system) => {
    const { openModel, model_list } = system;
    return {
      model_list,
      openModel,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

const MIN_MODEL_SIZE = 64;
const MAX_MODEL_SIZE = 2048;

export default function CheckpointModelView() {
  const { openModel, model_list } = useAppSelector(selector);
  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
  );

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [editModelFormValues, setEditModelFormValues] =
    useState<InvokeModelConfigProps>({
      name: '',
      description: '',
      thumbnail: '',
      website: '',
      config: 'configs/stable-diffusion/v1-inference.yaml',
      weights: '',
      modelid: '',
      rating: 0,
      ratingcount: 0,
      //vae: '',
      width: 512,
      height: 512,
      default: false,
      format: 'ckpt',
    });

  useEffect(() => {
    if (openModel) {
      const retrievedModel = pickBy(model_list, (_val, key) => {
        return isEqual(key, openModel);
      });
      setEditModelFormValues({
        name: openModel,
        description: retrievedModel[openModel]?.description,
        thumbnail: retrievedModel[openModel]?.thumbnail,
        website: retrievedModel[openModel]?.website,
        config: retrievedModel[openModel]?.config,
        rating: retrievedModel[openModel]?.rating,
        ratingcount: retrievedModel[openModel]?.ratingcount,
        weights: retrievedModel[openModel]?.weights,
        modelid: retrievedModel[openModel]?.modelid,
        width: retrievedModel[openModel]?.width,
        height: retrievedModel[openModel]?.height,
        default: retrievedModel[openModel]?.default,
        format: 'ckpt',
      });
    }
  }, [model_list, openModel]);

  const editModelFormSubmitHandler = (values: InvokeModelConfigProps) => {
    dispatch(
      addNewModel({
        ...values,
        width: Number(values.width),
        height: Number(values.height),
      })
    );
  };

  return openModel ? (
    <Flex flexDirection="column" rowGap="1rem" width="100%">
      <Flex alignItems="center">
        <Text fontSize="lg" fontWeight="bold">
          {openModel}
        </Text>
      </Flex>
      <Flex
        flexDirection="column"
        maxHeight={window.innerHeight - 270}
        overflowY="scroll"
        paddingRight="2rem"
      >
        <Formik
          enableReinitialize={true}
          initialValues={editModelFormValues}
          onSubmit={editModelFormSubmitHandler}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <VStack rowGap={'0.5rem'} alignItems="start">
                {/* Description */}
                <FormControl
                  isInvalid={!!errors.description && touched.description}
                  isRequired
                >
                  <VStack alignItems={'start'}>
                    <HStack>
                      <p>
                        <b>Model&nbsp;ID&nbsp;</b>
                      </p>
                      <p>{editModelFormValues.modelid}</p>
                    </HStack>
                    {/* add an image of maximum height 512px with automatic padding*/}
                    <img
                      src={editModelFormValues.thumbnail}
                      style={{
                        maxWidth: '512px',
                        maxHeight: '512px',
                        alignSelf: 'center',
                      }}
                    />
                  </VStack>
                </FormControl>
                {/* Weights */}
                <a href={editModelFormValues.website}>
                  <HStack
                    style={{
                      alignSelf: 'center',
                      width: 'fit-content',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      paddingLeft: '5rem',
                    }}
                  >
                    <img src="/civitai.png" />
                    <VStack>
                      <p>View On Civit AI.</p>
                      <p>Rating {editModelFormValues.rating} / 5</p>
                      <p>{editModelFormValues.ratingcount} ratings</p>
                    </VStack>
                  </HStack>
                </a>
              </VStack>
            </form>
          )}
        </Formik>
      </Flex>
    </Flex>
  ) : (
    <Flex
      width="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="var(--background-color)"
      borderRadius="0.5rem"
    >
      <Text fontWeight="bold" color="var(--subtext-color-bright)">
        Pick A Model To View
      </Text>
    </Flex>
  );
}
