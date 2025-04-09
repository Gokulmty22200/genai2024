from diagrams import Diagram, Cluster, Edge

from diagrams.aws.compute import EC2

from diagrams.aws.network import ALB, Route53, InternetGateway, VpnGateway,
    DirectConnect, Endpoint

from diagrams.aws.security import WAF, IdentityAndAccessManagementIam as IAM,
    IdentityAndAccessManagementIamRole as Role, CloudHSM, AdConnector as AD

from diagrams.aws.database import RDS

from diagrams.aws.general import Users, User, OfficeBuilding, InternetAlt2 as
    Internet

from diagrams.aws.storage import S3

from diagrams.aws.management import Cloudwatch

with Diagram("\n\nIdeaWorks Application Architecture", show=False,
    direction="LR", graph_attr={"fontsize": "40", "compound": "true", "splines":
    "spline"}, node_attr={"fontsize": "20", "height": "10.6"},
    edge_attr={"fontsize": "20", "minlen": "1", "penwidth": "1", "concentrate":
    "true"} , filename ="the_final_icon_architecture" , outformat="png") as diag:

    internet_users = Users("Internet Users")

    home_user = User("Home User")

    office_users = Users("Office Users")

    corporate_dc = OfficeBuilding("\nCorporate \nDC")

    route53 = Route53("Route \n53 DNS")

    internet = Internet("Internet")

    waf = WAF("\nWAF")

    igw = InternetGateway("\nInternet \nGateway")

    alb = ALB("\nALB")

    vpn_gateway = VpnGateway("VPN Gateway")

    direct_connect = DirectConnect("Direct \nConnect")

    with Cluster("Region A", direction="TB"):

        with Cluster("Availability Zone", direction="TB"):

            with Cluster("Web Zone", direction="TB"):

                web_jws_01 = EC2("\nWeb 01")

                web_jws_02 = EC2("\nWeb 02")

            with Cluster("Application Zone", direction="TB"):

                mw_jboss_01 = EC2("\nMW 01")

                mw_jboss_02 = EC2("\nMW 02")

            with Cluster("Data Zone", direction="TB"):

                db_mysql_01 = RDS("\n\nMSSQL & \nMySQL 01")

                db_mysql_02 = RDS("\n\nMSSQL & \nMySQL 02")

        with Cluster("Public Zone", direction="TB"):

            bastion_host = EC2("\nBastion Host")

        internet_users >> internet

        route53 >> internet

        internet >> waf

        waf >> igw

        igw >> alb

        alb >> web_jws_01

        alb >> web_jws_02

        web_jws_01 >> mw_jboss_01

        web_jws_01 >> mw_jboss_02

        web_jws_02 >> mw_jboss_01

        web_jws_02 >> mw_jboss_02

        mw_jboss_01 >> db_mysql_01

        mw_jboss_01 >> db_mysql_02

        mw_jboss_02 >> db_mysql_01

        mw_jboss_02 >> db_mysql_02

        home_user >> vpn_gateway

        vpn_gateway >> bastion_host

        office_users >> direct_connect

        corporate_dc >> direct_connect

        direct_connect >> bastion_host

        with Cluster("Other associated Services & Resources", direction="LR"):

            iam = IAM("IAM")

            role = Role("Role")

            cloudwatch = Cloudwatch("Cloudwatch")

            cloudhsm = CloudHSM("CloudHSM")

            ad_services = AD("AD Services")

            endpoints = Endpoint("Endpoint")

            s3 = S3("S3")

iam >> Edge(style="invis") >> role >> Edge(style="invis") >>
    cloudwatch >> Edge(style="invis") >> cloudhsm

ad_services >> Edge(style="invis") >> endpoints >>
    Edge(style="invis") >> s3