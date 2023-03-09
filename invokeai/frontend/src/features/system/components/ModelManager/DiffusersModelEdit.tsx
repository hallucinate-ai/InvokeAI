import { createSelector } from '@reduxjs/toolkit';

import IAIButton from 'common/components/IAIButton';
import IAIInput from 'common/components/IAIInput';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { systemSelector } from 'features/system/store/systemSelectors';

import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Text,
  VStack,
} from '@chakra-ui/react';

import { addNewModel } from 'app/socketio/actions';
import { Field, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import type { InvokeDiffusersModelConfigProps } from 'app/invokeai';
import type { RootState } from 'app/store';
import { isEqual, pickBy } from 'lodash';

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

export default function DiffusersModelEdit() {
  const { openModel, model_list } = useAppSelector(selector);
  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
  );

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [editModelFormValues, setEditModelFormValues] =
    useState<InvokeDiffusersModelConfigProps>({
      name: '',
      description: '',
      repo_id: '',
      path: '',
      default: false,
      format: 'diffusers',
    });

  useEffect(() => {
    if (openModel) {
      const retrievedModel = pickBy(model_list, (_val, key) => {
        return isEqual(key, openModel);
      });

      setEditModelFormValues({
        name: openModel,
        description: retrievedModel[openModel]?.description,
        path:
          retrievedModel[openModel]?.path &&
          retrievedModel[openModel]?.path !== 'None'
            ? retrievedModel[openModel]?.path
            : '',
        repo_id:
          retrievedModel[openModel]?.repo_id &&
          retrievedModel[openModel]?.repo_id !== 'None'
            ? retrievedModel[openModel]?.repo_id
            : '',
        default: retrievedModel[openModel]?.default,
        format: 'diffusers',
      });
    }
  }, [model_list, openModel]);

  const editModelFormSubmitHandler = (
    values: InvokeDiffusersModelConfigProps
  ) => {
    const diffusersModelToEdit = values;

    if (values.path === '') delete diffusersModelToEdit.path;
    if (values.repo_id === '') delete diffusersModelToEdit.repo_id;

    dispatch(addNewModel(values));
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
                  <FormLabel htmlFor="description" fontSize="sm">
                    {t('modelmanager:description')}
                  </FormLabel>
                  <VStack alignItems={'start'}>
                    <Field
                      as={IAIInput}
                      id="description"
                      name="description"
                      type="text"
                      width="lg"
                    />
                    {!!errors.description && touched.description ? (
                      <FormErrorMessage>{errors.description}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelmanager:descriptionValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* Path */}
                <FormControl
                  isInvalid={!!errors.path && touched.path}
                  isRequired
                >
                  <FormLabel htmlFor="path" fontSize="sm">
                    {t('modelmanager:modelLocation')}
                  </FormLabel>
                  <VStack alignItems={'start'}>
                    <Field
                      as={IAIInput}
                      id="path"
                      name="path"
                      type="text"
                      width="lg"
                    />
                    {!!errors.path && touched.path ? (
                      <FormErrorMessage>{errors.path}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelmanager:modelLocationValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* Repo ID */}
                <FormControl isInvalid={!!errors.repo_id && touched.repo_id}>
                  <FormLabel htmlFor="repo_id" fontSize="sm">
                    {t('modelmanager:repo_id')}
                  </FormLabel>
                  <VStack alignItems={'start'}>
                    <Field
                      as={IAIInput}
                      id="repo_id"
                      name="repo_id"
                      type="text"
                      width="lg"
                    />
                    {!!errors.repo_id && touched.repo_id ? (
                      <FormErrorMessage>{errors.repo_id}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelmanager:repoIDValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>
                <IAIButton
                  type="submit"
                  className="modal-close-btn"
                  isLoading={isProcessing}
                >
                  {t('modelmanager:updateModel')}
                </IAIButton>
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
        Pick A Model To Edit
      </Text>
    </Flex>
  );
}
