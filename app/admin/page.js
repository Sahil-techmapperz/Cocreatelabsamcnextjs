"use client"

import { useRouter } from 'next/navigation';
import React from 'react'

const page = () => {
    const router = useRouter();

  return  router.push(`/admin/login`);
 
}

export default page
