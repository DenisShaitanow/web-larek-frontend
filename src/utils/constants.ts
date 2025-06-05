export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

type SettingsKeys =
  | 'софт-скил'
  | 'другое'
  | 'дополнительное'
  | 'кнопка'
  | 'хард-скил';

export const settings: Record<SettingsKeys, string> = {
    'софт-скил': 'card__category_soft',
    'другое': 'card__category_other',
    'дополнительное' : 'card__category_additional',
    'кнопка': 'card__category_button',
    'хард-скил': 'card__category_hard'
};
