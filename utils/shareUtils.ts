import { Share } from 'react-native';
import { TFunction } from 'i18next';

export const shareResults = async (
  title: string,
  results: { label: string; value: string }[],
  t: TFunction
): Promise<void> => {
  const resultText = results
    .map((r) => `${r.label}: ${r.value}`)
    .join('\n');

  const message = `${t('share.resultTitle')}\n${title}\n\n${resultText}\n\n--- ${t('share.appName')} ---`;

  try {
    await Share.share({
      message,
      title: t('share.resultTitle'),
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
