Querying



    async getAllTargets() {
        return await this.targetRepository.createQueryBuilder('t')
        .select([
            't.name as target_name',
            `cast(sum(tbc.tof_target) as integer) as tof_target`,
            `cast(sum(tbc.tested_target) as integer) as tested_target`,
            `cast(sum(tbc.activated_target) as integer) as activated_target`,
            `cast(count(tbc.city) as integer) as no_of_cities`,
            't.created_at as date',
            't.status as status',
        ])
        .innerJoin(TargetByCity, 'tbc', 'tbc.target_id = t.id')
        .groupBy(`t.name, t.created_at, t.status`)
        .execute();
   }

   async getAllTargetCounts() {
    const builder = await this.targetByCityRepository.createQueryBuilder('tbc')
    .select([
        `cast(sum(tbc.tof_target) as integer) as tof_target`,
        `cast(sum(tbc.tested_target) as integer) as tested_target`,
        `cast(sum(tbc.activated_target) as integer) as activated_target`,

        `(select CAST(count(p.id) as integer) from champion_service.prospective_champions p
        inner join champion_service.campaigns c on p.campaign_id=c.id
        where p.stage = 1 and p.campaign_id is not null) as tof_achieved`,

        `(select CAST(count(p.id) as integer) from champion_service.prospective_champions p
        inner join champion_service.campaigns c on p.campaign_id=c.id
        where p.stage = 3 and p.campaign_id is not null) as tested_achieved`,

        `(select CAST(count(p.id) as integer) from champion_service.prospective_champions p
        inner join champion_service.campaigns c on p.campaign_id=c.id
        where p.stage = 9 and p.campaign_id is not null) as achieved_activated`,
    ])
    .execute();

    const nextBuilder = await this.prospectChampionRepository.createQueryBuilder('p')
    .select([
        `CAST(SUM(CASE WHEN p.stage = 1 THEN 1 ELSE 0 END) as INTEGER) as tof_achieved`,
        `CAST(SUM(CASE WHEN p.stage = 3 THEN 1 ELSE 0 END) as INTEGER) as tested_achieved`,
        `CAST(SUM(CASE WHEN p.stage = 9 THEN 1 ELSE 0 END) as INTEGER) as achieved_activated`,
    ])
    .innerJoin('campaigns', 'c', 'c.id = p.campaign_id')
    .where('p.campaign_id is not null')
    .execute();
   
    const totalTofAchieved = nextBuilder[0].tof_achieved;
    const totalTestedAchieved = nextBuilder[0].tested_achieved;
    const totalAchievedActivated = nextBuilder[0].achieved_activated;
    
      return {
        builder,
        totalTofAchieved,
        totalTestedAchieved,
        totalAchievedActivated
      };

    }
    
    async campaignEfficiencyy(target_id: string) {
      const builder = await this.targetByCityRepository.createQueryBuilder('tbc')
      .select([
          `cast (sum(tbc.tof_target) as integer) as tof_target`,
          `cast (sum(tbc.tested_target) as integer) as tested_target`,
          `cast (sum(tbc.activated_target) as integer) as activated_target`,

          `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
          inner join champion_service.campaigns c on p.campaign_id = c.id 
          where p.stage = 1 and p.campaign_id is not null) as acheived_tof`,

          `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
          inner join champion_service.campaigns c on p.campaign_id = c.id 
          where p.stage = 3 and p.campaign_id is not null) as acheived_tested`,

          `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
          inner join champion_service.campaigns c on p.campaign_id = c.id 
          where p.stage = 9 and p.campaign_id is not null) as acheived_activated`
      ])
      .where(`target_id = :target_id`, { target_id })
      .execute();

      return builder
    }

    async cityDistributionForATargetTOF(target_id: string) {
        const builder_tof = await this.targetByCityRepository.createQueryBuilder('tbc')
        .select([
            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 1 and p.campaign_id is not null and p.city ilike tbc.city) as target_acheived`,

            `tbc.tof_target as total_target`,
            `tbc.city as city`,
        ])
        .where(`tbc.target_id = :target_id`, { target_id })
        .execute()
        
        return builder_tof;
    }

    async cityDistributionForATargetTested(target_id: string) {
        const builder_tested = await this.targetByCityRepository.createQueryBuilder('tbc')
        .select([
            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 3 and p.campaign_id is not null and p.city ilike tbc.city) as target_acheived`,

            `tbc.tested_target as total_target`,
            `tbc.city as city`,
        ])
        .where(`tbc.target_id = :target_id`, { target_id })
        .execute()
        
        return builder_tested;
    }

    async cityDistributionForATargetActivated(target_id: string) {
        const builder_tested = await this.targetByCityRepository.createQueryBuilder('tbc')
        .select([
            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 9 and p.campaign_id is not null and p.city ilike tbc.city) as target_acheived`,

            `tbc.activated_target as total_target`,
            `tbc.city as city`,
        ])
        .where(`tbc.target_id = :target_id`, { target_id })
        .execute()
        
        return builder_tested;
    }

    async targetDetails(target_id: string) {
        const builder = await this.targetByCityRepository.createQueryBuilder('tbc')
        .select([
            `tbc.city as city`,
            `tbc.tof_target as set_tof`,
            `tbc.tested_target as set_tested`,
            `tbc.activated_target as set_activated`,

            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 1 and p.campaign_id is not null and p.city ilike tbc.city) as acheived_tof`,

            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 3 and p.campaign_id is not null and p.city ilike tbc.city) as acheived_tested`,

            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id
            where p.stage = 9 and p.campaign_id is not null and p.city ilike tbc.city) as acheived_activated`,

            `(select c.created_by from champion_service.campaigns c
            inner join champion_service.targets t on c.target_id = t.id 
            where t.id = '${target_id}' and c.city ilike tbc.city limit 1) as fsm_incharge`,
            
            `(select cast(count(c.id) as integer) from champion_service.campaigns c 
            inner join champion_service.targets t on c.target_id = t.id 
            where t.id = '${target_id}' and c.city ilike tbc.city) as no_of_campaigns`,
        ])
        .where(`tbc.target_id = :target_id`, { target_id })
        .execute()

        return builder;
    }

    async targetHistoryy(city: string) {
        const builder = await this.targetRepository.createQueryBuilder('t')
        .select([
            `t.name as target_name`,
            `t.status as target_status`,
            `tbc.tof_target as setTOF`,
            `tbc.tested_target as setTested`,
            `tbc.activated_target as set_activated`,

            `(select cast(count(p.id) as integer) from champion_service.prospective_champions p
            inner join champion_service.campaigns c on p.campaign_id = c.id)
            where `
            
        ])
        .innerJoin('target_by_cities', 'tbc', 'tbc.target_id = t.id')
        .where(`tbc.city = :city`, { city })

    }





 @Get('gett/:target_id')
    @UseGuards(AuthGuard('jwt'))
    // @Roles(ROLEFUNCTION.FMM)
    async getAllTargerss(@Param('target_id') target_id: string) {
        try {
            return await this.targetsService.targetDetails(target_id);
        } catch (error) {
            throw new HttpException({ error: error.response }, HttpStatus.EXPECTATION_FAILED);
        }
    }
    @Get('/gett')
    @UseGuards(AuthGuard('jwt'))
    // @Roles(ROLEFUNCTION.FMM)
    async getAllTargers() {
        try {
            return await this.targetsService.getAllTargetCounts();
        } catch (error) {
            throw new HttpException({ error: error.response }, HttpStatus.EXPECTATION_FAILED);
        }
    }


