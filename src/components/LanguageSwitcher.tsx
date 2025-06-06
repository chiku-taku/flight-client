import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, FormControlLabel, Typography, Box } from '@mui/material';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';

  const toggleLanguage = () => {
    i18n.changeLanguage(isChinese ? 'en' : 'zh');
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body1">
        {'English'}
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={isChinese}
            onChange={toggleLanguage}
            color="primary"
            size="small"
          />
        }
        label=""
      />
      
      <Typography variant="body1">
        {'中文'}
      </Typography>
    </Box>
  );
};

export default LanguageSwitcher;