import { Share } from 'react-native';
import { TFunction } from 'i18next';

export const shareResults = async (
  title: string,
  results: { label: string; value: string }[],
  t: TFunction
): Promise<'completed' | 'dismissed' | 'failed'> => {
  const resultText = results
    .map((r) => `${r.label}: ${r.value}`)
    .join('\n');

  const message = `${t('share.resultTitle')}\n${title}\n\n${resultText}\n\n--- ${t('share.appName')} ---`;

  try {
    const response = await Share.share({
      message,
      title: t('share.resultTitle'),
    });
    return response.action === Share.sharedAction ? 'completed' : 'dismissed';
  } catch (error) {
    console.error('Error sharing:', error);
    return 'failed';
  }
};
