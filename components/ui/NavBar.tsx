import { FC } from 'react';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

interface Props {}

export const NavBar: FC<Props> = () => {
  return (
    <AppBar
      position='sticky'
      elevation={0}
    >
      <Toolbar>
        <IconButton size='large' edge='start'>
          <MenuOutlinedIcon />
        </IconButton>

        <Typography variant='h6'>Zurich</Typography>
      </Toolbar>
    </AppBar>
  );
};
