'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface HumiItem {
  label: string;
  percentage: number;
  count